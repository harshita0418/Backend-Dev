// Exercise 3: Contact form routes

const express = require('express');
const router  = express.Router();

router.get('/contact', (req, res) => {
  res.render('contact', { errors: [], old: {} });
});

router.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push('Full name must be at least 2 characters.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.push('A valid email address is required.');
  if (!message || message.trim().length < 10)
    errors.push('Message must be at least 10 characters.');

  if (errors.length) {
    return res.status(422).render('contact', { errors, old: { name, email, subject, message } });
  }

  res.render('contact_success', {
    name: name.trim(),
    email: email.trim(),
    subject: subject || null,
    message: message.trim(),
  });
});

module.exports = router;
