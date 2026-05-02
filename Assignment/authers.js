const express = require('express');
const app = express();
app.use(express.json());

let books = [
  { id: 1, title: 'The Pragmatic Programmer', authorId: 1, year: 1999 },
  { id: 2, title: 'Clean Code',               authorId: 2, year: 2008 },
  { id: 3, title: 'You Don\'t Know JS',        authorId: 3, year: 2015 },
  { id: 4, title: 'Eloquent JavaScript',       authorId: 4, year: 2018 },
  { id: 5, title: 'Refactoring',               authorId: 5, year: 1999 },
];


let authors = [
  { id: 1, name: 'Andrew Hunt',      nationality: 'American', birthYear: 1964 },
  { id: 2, name: 'Robert C. Martin', nationality: 'American', birthYear: 1952 },
  { id: 3, name: 'Kyle Simpson',     nationality: 'American', birthYear: 1980 },
  { id: 4, name: 'Marijn Haverbeke', nationality: 'Dutch',    birthYear: 1982 },
  { id: 5, name: 'Martin Fowler',    nationality: 'British',  birthYear: 1963 },
];

let nextBookId   = 6;
let nextAuthorId = 6;

const validateAuthorBody = (req, res, next) => {
  const { name } = req.body;
  if (!name || String(name).trim() === '') {
    return res.status(400).json({
      error:   'Validation Error',
      message: 'Field `name` is required',
    });
  }
  next();
};

const validateBirthYear = (req, res, next) => {
  const { birthYear } = req.body;
  if (birthYear === undefined) return next(); // optional

  const by          = Number(birthYear);
  const currentYear = new Date().getFullYear();

  if (!Number.isInteger(by) || by < 1000 || by > currentYear) {
    return res.status(400).json({
      error:   'Validation Error',
      field:   'birthYear',
      message: `'birthYear' must be an integer between 1000 and ${currentYear}`,
    });
  }
  next();
};


app.get('/authors', (req, res) => {
  const result = authors.map((a) => ({
    ...a,
    bookCount: books.filter((b) => b.authorId === a.id).length,
  }));
  res.json({ total: result.length, data: result });
});

app.get('/authors/:id', (req, res) => {
  const author = authors.find((a) => a.id === Number(req.params.id));
  if (!author) return res.status(404).json({ error: 'Author not found' });

  const authorBooks = books.filter((b) => b.authorId === author.id);

  res.json({ ...author, books: authorBooks });
});

app.post('/authors', validateAuthorBody, validateBirthYear, (req, res) => {
  const { name, nationality, birthYear } = req.body;

  const author = {
    id:          nextAuthorId++,
    name:        String(name).trim(),
    nationality: nationality ?? null,
    birthYear:   birthYear !== undefined ? Number(birthYear) : null,
  };

  authors.push(author);
  res.status(201).json(author);
});

app.put('/authors/:id', validateAuthorBody, validateBirthYear, (req, res) => {
  const index = authors.findIndex((a) => a.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Author not found' });

  const { name, nationality, birthYear } = req.body;

  authors[index] = {
    id:          authors[index].id,
    name:        String(name).trim(),
    nationality: nationality ?? authors[index].nationality,
    birthYear:   birthYear !== undefined ? Number(birthYear) : authors[index].birthYear,
  };

  res.json(authors[index]);
});


app.delete('/authors/:id', (req, res) => {
  const index = authors.findIndex((a) => a.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Author not found' });

  const deleted      = authors.splice(index, 1)[0];
  const removedBooks = books.filter((b) => b.authorId === deleted.id);
  books              = books.filter((b) => b.authorId !== deleted.id);

  res.json({
    message:      'Author deleted',
    author:       deleted,
    booksRemoved: removedBooks.length,
  });
});


app.get('/books', (req, res) => {
  const enriched = books.map((b) => ({
    ...b,
    author: authors.find((a) => a.id === b.authorId) ?? null,
  }));
  res.json({ total: enriched.length, data: enriched });
});

app.get('/books/:id', (req, res) => {
  const book = books.find((b) => b.id === Number(req.params.id));
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const author = authors.find((a) => a.id === book.authorId) ?? null;
  res.json({ ...book, author });
});

app.post('/books', (req, res) => {
  const { title, authorId, year } = req.body;
  if (!title || !authorId || !year)
    return res.status(400).json({ error: 'title, authorId, and year are required' });
  if (!authors.find((a) => a.id === Number(authorId)))
    return res.status(404).json({ error: `Author with id ${authorId} not found` });
  const book = { id: nextBookId++, title, authorId: Number(authorId), year: Number(year) };
  books.push(book);
  res.status(201).json(book);
});

app.put('/books/:id', (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  const { title, authorId, year } = req.body;
  if (!title || !authorId || !year)
    return res.status(400).json({ error: 'title, authorId, and year are required' });
  books[index] = { ...books[index], title, authorId: Number(authorId), year: Number(year) };
  res.json(books[index]);
});

app.delete('/books/:id', (req, res) => {
  const index = books.findIndex((b) => b.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  const deleted = books.splice(index, 1)[0];
  res.json({ message: 'Book deleted', book: deleted });
});


app.listen(3004, () => console.log('running on 3004'));
module.exports = app;