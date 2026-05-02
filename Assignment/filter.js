const express = require('express');
const app = express();
app.use(express.json());

let books = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Andrew Hunt',       year: 1999 },
  { id: 2, title: 'Clean Code',               author: 'Robert C. Martin',  year: 2008 },
  { id: 3, title: 'You Don\'t Know JS',        author: 'Kyle Simpson',      year: 2015 },
  { id: 4, title: 'Eloquent JavaScript',       author: 'Marijn Haverbeke',  year: 2018 },
  { id: 5, title: 'JavaScript: The Good Parts',author: 'Douglas Crockford', year: 2008 },
];

let nextId = 6;


app.get('/books', (req, res) => {
  const { author, year } = req.query;

  let result = books.filter((book) => {
    const matchesAuthor = author
      ? book.author.toLowerCase().includes(author.toLowerCase())
      : true;

    const matchesYear = year
      ? book.year === Number(year)
      : true;

    return matchesAuthor && matchesYear;
  });

  res.json({
    total: result.length,
    filters: {
      ...(author && { author }),
      ...(year   && { year: Number(year) }),
    },
    data: result,
  });
});

// GET /books/:id
app.get('/books/:id', (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

// POST /books
app.post('/books', (req, res) => {
  const { title, author, year } = req.body;
  if (!title || !author || !year)
    return res.status(400).json({ error: 'title, author, and year are required' });
  const book = { id: nextId++, title, author, year: Number(year) };
  books.push(book);
  res.status(201).json(book);
});

// PUT /books/:id
app.put('/books/:id', (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  const { title, author, year } = req.body;
  if (!title || !author || !year)
    return res.status(400).json({ error: 'title, author, and year are required' });
  books[index] = { ...books[index], title, author, year: Number(year) };
  res.json(books[index]);
});

// DELETE /books/:id
app.delete('/books/:id', (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  const deleted = books.splice(index, 1)[0];
  res.json({ message: 'Book deleted', book: deleted });
});


app.listen(3001, () => console.log("running on port 3001"));
module.exports = app;