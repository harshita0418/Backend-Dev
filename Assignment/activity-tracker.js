const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

mongoose
.connect("mongodb://localhost:27017/ecommerce")
.then(()=> console.log("Connected to MongoDB"))
.catch((err) => console.error("Could not connect to MongoDB", err));

const sessionSchema = new mongoose.Schema({
  loginAt: { type: Date },
  logoutAt: { type: Date },
  duration: { type: Number },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  lastLoginAt: { type: Date, default: null },
  lastLogoutAt: { type: Date, default: null },
  lastActiveAt: { type: Date, default: null },
  isOnline: { type: Boolean, default: false },
  loginHistory: { type: [sessionSchema], default: [] },
}, { timestamps: true });

userSchema.pre('save', function (next) {
  if (!this.isNew) {
    console.log(`[Activity] "${this.email}" changed: ${this.modifiedPaths().join(', ')}`);
  }
  next();
});

userSchema.post('save', function (doc) {
  console.log(`[Activity] "${doc.email}" saved at ${new Date().toISOString()}`);
});

userSchema.pre('findOne', function (next) {
  this.updateOne({ lastActiveAt: new Date() });
  next();
});

userSchema.methods.login = async function () {
  this.lastLoginAt = new Date();
  this.lastActiveAt = new Date();
  this.isOnline = true;
  this.loginHistory.push({ loginAt: this.lastLoginAt });
  await this.save();
  return this;
};

userSchema.methods.logout = async function () {
  const now = new Date();
  this.lastLogoutAt = now;
  this.lastActiveAt = now;
  this.isOnline = false;

  const openSession = [...this.loginHistory].reverse().find((s) => !s.logoutAt);
  if (openSession) {
    openSession.logoutAt = now;
    openSession.duration = now - openSession.loginAt;
  }

  await this.save();
  return this;
};

userSchema.methods.getActivitySummary = function () {
  const totalSessions = this.loginHistory.length;
  const totalDurationMs = this.loginHistory.reduce((sum, s) => sum + (s.duration || 0), 0);

  return {
    email: this.email,
    isOnline: this.isOnline,
    lastLoginAt: this.lastLoginAt,
    lastLogoutAt: this.lastLogoutAt,
    lastActiveAt: this.lastActiveAt,
    totalSessions,
    totalTimeOnline: `${Math.round(totalDurationMs / 1000)}s`,
    loginHistory: this.loginHistory,
  };
};

const User = mongoose.model('User', userSchema);

app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/users/:id/login', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.login();
    res.json({ message: 'Logged in', activity: user.getActivitySummary() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/users/:id/logout', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.logout();
    res.json({ message: 'Logged out', activity: user.getActivitySummary() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/users/:id/activity', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.getActivitySummary());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-loginHistory');
    res.json({ total: users.length, data: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3003, () => {
  console.log('port running on 3003');
});