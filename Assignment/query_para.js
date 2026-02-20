// Exercise 1: Filter users by query parameters
// GET /users?name=alice&role=admin

const express = require('express');
const router  = express.Router();

const users = [
  { id: 1, name: 'Alice Johnson', role: 'admin',  email: 'alice@example.com' },
  { id: 2, name: 'Bob Smith',     role: 'user',   email: 'bob@example.com' },
  { id: 3, name: 'Alice Carter',  role: 'user',   email: 'acarter@example.com' },
  { id: 4, name: 'David Lee',     role: 'editor', email: 'david@example.com' },
  { id: 5, name: 'Eve Adams',     role: 'admin',  email: 'eve@example.com' },
];

router.get('/users', (req, res) => {
  const { name, role } = req.query;
  let filtered = [...users];

  if (name) filtered = filtered.filter(u => u.name.toLowerCase().includes(name.toLowerCase()));
  if (role) filtered = filtered.filter(u => u.role.toLowerCase() === role.toLowerCase());

  res.json({ query: { name: name || null, role: role || null }, count: filtered.length, users: filtered });
});

module.exports = router;
