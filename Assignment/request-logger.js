const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'requests.log');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${Date.now() - startTime}ms`,
    };

    const line = JSON.stringify(logEntry) + '\n';

    fs.appendFile(LOG_FILE, line, (err) => {
      if (err) console.error('Could not write log:', err.message);
    });

    console.log(`[${logEntry.timestamp}] ${logEntry.method} ${logEntry.url} → ${logEntry.status} (${logEntry.responseTime})`);
  });

  next();
};

app.use(requestLogger);

app.get('/', (req, res) => {
  res.json({ message: 'Home route' });
});

app.get('/users', (req, res) => {
  res.json({ users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] });
});

app.get('/users/:id', (req, res) => {
  const id = Number(req.params.id);
  if (id !== 1 && id !== 2) return res.status(404).json({ error: 'User not found' });
  res.json({ id, name: id === 1 ? 'Alice' : 'Bob' });
});

app.post('/users', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  res.status(201).json({ id: 3, name });
});

app.get('/logs', (req, res) => {
  if (!fs.existsSync(LOG_FILE)) return res.json({ logs: [] });

  const lines = fs.readFileSync(LOG_FILE, 'utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  res.json({ count: lines.length, logs: lines.slice(-50).reverse() });
});

app.listen(3001, () => {
  console.log('port running on 3001');
});