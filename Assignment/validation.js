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


const validateYear = (req, res, next) => {

    const yearRaw = req.query.year ?? req.body?.year;

  if (yearRaw === undefined || yearRaw === null || yearRaw === '') {
    return next();
  }

  const year        = Number(yearRaw);
  const currentYear = new Date().getFullYear();

  if (isNaN(year) || !Number.isInteger(year)) {
    return res.status(400).json({
      error:   'Validation Error',
      field:   'year',
      message: `'year' must be a valid integer, received: "${yearRaw}"`,
    });
  }

  if (year < 1000 || year > currentYear) {
    return res.status(400).json({
      error:   'Validation Error',
      field:   'year',
      message: `'year' must be between 1000 and ${currentYear}, received: ${year}`,
    });
  }

  next();
};

const validateBookBody = (req, res, next) => {
  const { title, author, year } = req.body;
  const missing = [];
  if (!title  || String(title).trim()  === '') missing.push('title');
  if (!author || String(author).trim() === '') missing.push('author');
  if (!year)                                   missing.push('year');

  if (missing.length > 0) {
    return res.status(400).json({
      error:   'Validation Error',
      message: `Missing required fields: ${missing.join(', ')}`,
    });
  }

  next();
};

app.get('/books', validateYear, (req, res) => {
  const { author, year } = req.query;

  const result = books.filter((book) => {
    const matchesAuthor = author ? book.author.toLowerCase().includes(author.toLowerCase()) : true;
    const matchesYear   = year   ? book.year === Number(year)                               : true;
    return matchesAuthor && matchesYear;
  });

  res.json({ total: result.length, data: result });
});

app.get('/books/:id', (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: 'Book not found' });
  res.json(book);
});


app.post('/books', validateBookBody, validateYear, (req, res) => {
  const { title, author, year } = req.body;
  const book = { id: nextId++, title, author, year: Number(year) };
  books.push(book);
  res.status(201).json(book);
});

app.put('/books/:id', validateBookBody, validateYear, (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  const { title, author, year } = req.body;
  books[index] = { ...books[index], title, author, year: Number(year) };
  res.json(books[index]);
});

app.delete('/books/:id', (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  const deleted = books.splice(index, 1)[0];
  res.json({ message: 'Book deleted', book: deleted });
});

app.listen(3002, () => console.log('running on 3002'));
module.exports = app;