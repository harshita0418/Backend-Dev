const express = require('express');
const cors = require('cors');
const app = express();

// CORS Middleware
app.use(cors());
app.get('/data', (req, res) => {
  res.json({ message: 'This is CORS-enabled data!' });
});

app.listen(3000, () => {
  console.log('CORS-enabled server running on port 3000');
});

//custom Cors
// front-end allow

app.use
   cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
})

// Multiple front-end allow

const allowedOrigins = [
  'http://localhost:3000',
  'http://example.com'
];
app.use(cors({
  origin: allowedOrigins,
}));
app.listen(3000, () => {
  console.log('CORS-enabled server running on port 3000');
});
