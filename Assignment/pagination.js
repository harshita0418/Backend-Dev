const express = require('express');
const app = express();
app.use(express.json());

let books = [
  { id:  1, title: 'The Pragmatic Programmer',       author: 'Andrew Hunt',       year: 1999 },
  { id:  2, title: 'Clean Code',                     author: 'Robert C. Martin',  year: 2008 },
  { id:  3, title: 'You Don\'t Know JS',              author: 'Kyle Simpson',      year: 2015 },
  { id:  4, title: 'Eloquent JavaScript',             author: 'Marijn Haverbeke',  year: 2018 },
  { id:  5, title: 'JavaScript: The Good Parts',     author: 'Douglas Crockford', year: 2008 },
  { id:  6, title: 'Design Patterns',                author: 'Gang of Four',      year: 1994 },
  { id:  7, title: 'The Mythical Man-Month',         author: 'Frederick Brooks',  year: 1975 },
  { id:  8, title: 'Refactoring',                    author: 'Martin Fowler',     year: 1999 },
  { id:  9, title: 'Structure and Interpretation',   author: 'Harold Abelson',    year: 1996 },
  { id: 10, title: 'Code Complete',                  author: 'Steve McConnell',   year: 2004 },
  { id: 11, title: 'The Art of Computer Programming',author: 'Donald Knuth',      year: 1968 },
  { id: 12, title: 'Introduction to Algorithms',     author: 'Thomas Cormen',     year: 1990 },
];

let nextId = 13;

const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page !== undefined) {
    const p = Number(page);
    if (!Number.isInteger(p) || p < 1) {
      return res.status(400).json({
        error:   'Validation Error',
        field:   'page',
        message: `'page' must be a positive integer, received: "${page}"`,
      });
    }
  }

  if (limit !== undefined) {
    const l = Number(limit);
    if (!Number.isInteger(l) || l < 1 || l > 100) {
      return res.status(400).json({
        error:   'Validation Error',
        field:   'limit',
        message: `'limit' must be an integer between 1 and 100, received: "${limit}"`,
      });
    }
  }

  next();
};


app.get('/books', validatePagination, (req, res) => {
  const { author, year, page = '1', limit = '10' } = req.query;


  let result = books.filter((book) => {
    const matchesAuthor = author ? book.author.toLowerCase().includes(author.toLowerCase()) : true;
    const matchesYear   = year   ? book.year === Number(year)                               : true;
    return matchesAuthor && matchesYear;
  });

  const total = result.length;


  const pageNum    = Number(page);
  const limitNum   = Number(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex   = startIndex + limitNum;

  const paginatedData = result.slice(startIndex, endIndex);


  res.json({
    data: paginatedData,
    pagination: {
      total,
      page:        pageNum,
      limit:       limitNum,
      totalPages:  Math.ceil(total / limitNum),
      hasNextPage: endIndex < total,
      hasPrevPage: pageNum > 1,
    },
    ...(author || year
      ? { filters: { ...(author && { author }), ...(year && { year: Number(year) }) } }
      : {}),
  });
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


app.listen(3003, () => console.log('Exercise 3 running on http://localhost:3003'));
module.exports = app;