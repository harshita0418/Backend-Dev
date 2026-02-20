const express = require('express');
const path    = require('path');
const app     = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Exercise 2: Response-time logger
app.use(require('./middleware_log'));

// Exercise 1: Users with query-param filtering
app.use('/', require('./query_para'));

// Exercise 3: Contact form
app.use('/', require('./contact_form_routes'));

// Exercise 5: Photo gallery
app.use('/', require('./photo_gallery'));

// Exercise 6: Blog
app.use('/', require('./blog'));

// Home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
    <title>Express Exercises</title>
    <style>
      body { font-family:system-ui,sans-serif; max-width:600px; margin:4rem auto; padding:0 1rem; }
      h1 { color:#1a1a2e; } ul { line-height:2.2; font-size:1.05rem; } a { color:#2563eb; }
    </style></head><body>
    <h1>Express Practice Exercises</h1>
    <ul>
      <li>Ex 1 — <a href="/users">/users</a> — try <a href="/users?name=alice">?name=alice</a> or <a href="/users?role=admin">?role=admin</a></li>
      <li>Ex 2 — Response-time logger (check your terminal)</li>
      <li>Ex 3 — <a href="/contact">Contact Form</a></li>
      <li>Ex 4 — <a href="/missing-page">Custom 404 Page</a></li>
      <li>Ex 5 — <a href="/gallery">Photo Gallery</a></li>
      <li>Ex 6 — <a href="/blog">Blog</a></li>
    </ul>
    </body></html>
  `);
});

// Exercise 4: Custom 404 — must be last
app.use((req, res) => {
  res.status(404).render('404', { url: req.originalUrl });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
