const express = require('express');
const app = express();
app.use(express.json());

let books = [
  { id:  1, title: 'The Pragmatic Programmer',        author: 'Andrew Hunt',       year: 1999 },
  { id:  2, title: 'Clean Code',                      author: 'Robert C. Martin',  year: 2008 },
  { id:  3, title: 'You Don\'t Know JS',               author: 'Kyle Simpson',      year: 2015 },
  { id:  4, title: 'Eloquent JavaScript',              author: 'Marijn Haverbeke',  year: 2018 },
  { id:  5, title: 'JavaScript: The Good Parts',      author: 'Douglas Crockford', year: 2008 },
  { id:  6, title: 'Design Patterns',                 author: 'Gang of Four',      year: 1994 },
  { id:  7, title: 'The Mythical Man-Month',          author: 'Frederick Brooks',  year: 1975 },
  { id:  8, title: 'Refactoring: Improving the Code', author: 'Martin Fowler',     year: 1999 },
  { id:  9, title: 'Code Complete',                   author: 'Steve McConnell',   year: 2004 },
  { id: 10, title: 'Introduction to Algorithms',      author: 'Thomas Cormen',     year: 1990 },
];

let nextId = 11;


app.get('/books/search', (req, res) => {
  const { q } = req.query;


  if (!q || String(q).trim() === '') {
    return res.status(400).json({
      error:   'Bad Request',
      message: 'Query parameter ?q= is required and must not be blank',
      example: '/books/search?q=javascript',
    });
  }

  const term    = String(q).trim().toLowerCase();
  const results = books.filter((book) =>
    book.title.toLowerCase().includes(term)
  );

  res.json({
    query: q,
    count: results.length,
    data:  results,
  });
});



app.get('/books', (req, res) => {
  res.json({ total: books.length, data: books });
});

app.get('/books/:id', (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});

app.post('/books', (req, res) => {
  const { title, author, year } = req.body;
  if (!title || !author || !year)
    return res.status(400).json({ error: 'title, author, and year are required' });
  const book = { id: nextId++, title, author, year: Number(year) };
  books.push(book);
  res.status(201).json(book);
});

app.put('/books/:id', (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  const { title, author, year } = req.body;
  if (!title || !author || !year)
    return res.status(400).json({ error: 'title, author, and year are required' });
  books[index] = { ...books[index], title, author, year: Number(year) };
  res.json(books[index]);
});

app.delete('/books/:id', (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  const deleted = books.splice(index, 1)[0];
  res.json({ message: 'Book deleted', book: deleted });
});


app.listen(3005, () => console.log('Exercise 5 running on http://localhost:3005'));
module.exports = app;