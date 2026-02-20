// Exercise 6: Blog routes

const express = require('express');
const router  = express.Router();

let posts = [
  { id: 1, title: 'Welcome to My Blog', category: 'Lifestyle', body: 'This is the very first post on this blog.\n\nThanks for stopping by!', createdAt: new Date('2025-01-15') },
  { id: 2, title: 'Getting Started with Express.js', category: 'Tutorial', body: 'Express.js is a minimal web framework for Node.js.\n\nIn this post we cover routing, middleware, and EJS templates.', createdAt: new Date('2025-02-01') },
];
let nextId = 3;

// List all posts
router.get('/blog', (req, res) => {
  const sorted = [...posts].sort((a, b) => b.createdAt - a.createdAt);
  res.render('blog_list', { posts: sorted });
});

// New post form — must be before /:id
router.get('/blog/new', (req, res) => {
  res.render('blog_new', { errors: [], old: {} });
});

// Create post
router.post('/blog', (req, res) => {
  const { title, category, body } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) errors.push('Title must be at least 3 characters.');
  if (!body  || body.trim().length < 20)  errors.push('Content must be at least 20 characters.');

  if (errors.length) return res.status(422).render('blog_new', { errors, old: { title, category, body } });

  const post = { id: nextId++, title: title.trim(), category: category || null, body: body.trim(), createdAt: new Date() };
  posts.push(post);
  res.redirect(`/blog/${post.id}`);
});

// View single post
router.get('/blog/:id', (req, res) => {
  const post = posts.find(p => p.id === Number(req.params.id));
  if (!post) return res.status(404).render('404', { url: req.originalUrl });
  res.render('blog_post', { post });
});

module.exports = router;
