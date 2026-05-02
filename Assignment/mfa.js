const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const OTP_TTL_MS = 5 * 60 * 1000;

const users = [
  { id: 1, email: 'alice@example.com', password: 'password123', role: 'admin' },
  { id: 2, email: 'bob@example.com', password: 'password456', role: 'user' },
];

const otpStore = new Map();

const generateOTP = (userId) => {
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
  const expiresAt = Date.now() + OTP_TTL_MS;
  otpStore.set(userId, { code, expiresAt });
  return code;
};

const verifyOTP = (userId, inputCode) => {
  const entry = otpStore.get(userId);
  if (!entry) return { valid: false, reason: 'No OTP issued for this user' };
  if (Date.now() > entry.expiresAt) return { valid: false, reason: 'OTP has expired' };
  if (entry.code !== String(inputCode)) return { valid: false, reason: 'Incorrect OTP' };
  otpStore.delete(userId);
  return { valid: true };
};

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const verifyOTPMiddleware = (req, res, next) => {
  const otpCode = req.headers['x-otp'];

  if (!otpCode) {
    return res.status(401).json({ error: 'Missing X-OTP header. Request a code via POST /auth/otp first.' });
  }

  const result = verifyOTP(req.user.id, otpCode);

  if (!result.valid) {
    return res.status(401).json({ error: result.reason });
  }

  next();
};

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

  const user = users.find((u) => u.email === email);
  if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  res.json({ message: 'Login success. Now call POST /auth/otp to get your OTP.', token });
});

app.post('/auth/otp', verifyJWT, (req, res) => {
  const code = generateOTP(req.user.id);
  console.log(`[OTP] Code for ${req.user.email}: ${code}`);
  res.json({ message: 'OTP sent (check server console)', _demo_otp: code });
});

app.get('/profile', verifyJWT, (req, res) => {
  res.json({ message: 'Profile — JWT only', user: req.user });
});

app.post('/admin/transfer', verifyJWT, verifyOTPMiddleware, (req, res) => {
  res.json({ message: 'Transfer approved — JWT + OTP verified', user: req.user });
});

app.delete('/admin/user/:id', verifyJWT, verifyOTPMiddleware, (req, res) => {
  res.json({ message: `User ${req.params.id} deleted — MFA passed`, by: req.user.email });
});

app.listen(3002, () => {
  console.log('port running on 3002');
});