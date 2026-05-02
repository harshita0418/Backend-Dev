const express = require('express');

const app = express();
app.use(express.json());

const escapeHtml = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

const stripMongoOperators = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(stripMongoOperators);
  }

  return Object.keys(obj).reduce((clean, key) => {
    if (key.startsWith('$')) {
      console.warn(`[Sanitizer] Stripped dangerous key: "${key}"`);
      return clean;
    }
    clean[key] = stripMongoOperators(obj[key]);
    return clean;
  }, {});
};

const SQL_PATTERNS = [
  /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)(\s|$)/i,
  /--/,
  /;\s*(DROP|DELETE|UPDATE|INSERT)/i,
  /'.*OR.*'.*=.*'/i,
  /\/\*.*\*\//,
];

const containsSQLInjection = (str) => {
  if (typeof str !== 'string') return false;
  return SQL_PATTERNS.some((pattern) => pattern.test(str));
};

const deepSanitize = (value, path = 'root') => {
  if (typeof value === 'string') {
    if (containsSQLInjection(value)) {
      console.warn(`[Sanitizer] Possible SQL injection at "${path}": ${value.slice(0, 80)}`);
    }
    return escapeHtml(value);
  }

  if (Array.isArray(value)) {
    return value.map((item, i) => deepSanitize(item, `${path}[${i}]`));
  }

  if (typeof value === 'object' && value !== null) {
    const clean = stripMongoOperators(value);
    return Object.keys(clean).reduce((acc, key) => {
      acc[key] = deepSanitize(clean[key], `${path}.${key}`);
      return acc;
    }, {});
  }

  return value;
};

const sanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = deepSanitize(req.body, 'body');
  }

  if (req.query && typeof req.query === 'object') {
    req.query = deepSanitize(req.query, 'query');
  }

  next();
};

app.use(sanitize);

const users = [];
let nextId = 1;

app.get('/users', (req, res) => {
  const { search } = req.query;
  if (search) {
    const results = users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );
    return res.json({ data: results });
  }
  res.json({ data: users });
});

app.post('/users', (req, res) => {
  const { name, email, bio } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

  const user = { id: nextId++, name, email, bio: bio || '' };
  users.push(user);
  res.status(201).json({ message: 'User created (input was sanitized)', user });
});

app.post('/comments', (req, res) => {
  const { comment } = req.body;
  if (!comment) return res.status(400).json({ error: 'comment is required' });
  res.json({ message: 'Comment saved (sanitized)', comment });
});

app.listen(3005, () => {
  console.log('port running on 3005');
});