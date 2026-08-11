const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nutrimatch_dev_secret_2024';

let users = [
  { id: 'ngo1', name: 'Akanksha Foundation', email: 'akanksha@ngo.org', password_hash: bcrypt.hashSync('password', 8), role: 'ngo', organization: 'Akanksha Foundation' },
  { id: 'ngo2', name: 'Smile Foundation', email: 'smile@ngo.org', password_hash: bcrypt.hashSync('password', 8), role: 'ngo', organization: 'Smile Foundation' },
  { id: 'pm1', name: 'Priya Mehta', email: 'priya@govt.in', password_hash: bcrypt.hashSync('password', 8), role: 'program_manager', organization: 'MoHFW' },
  { id: 'donor1', name: 'Rahul Sharma', email: 'rahul@email.com', password_hash: bcrypt.hashSync('password', 8), role: 'donor', organization: null },
];

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password_hash, ...userSafe } = user;
  res.json({ success: true, token, user: userSafe });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role, organization } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ success: false, error: 'Email already registered' });
  }
  const newUser = {
    id: `user_${Date.now()}`,
    name, email,
    password_hash: bcrypt.hashSync(password, 8),
    role, organization: organization || null,
  };
  users.push(newUser);
  const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  const { password_hash, ...userSafe } = newUser;
  res.status(201).json({ success: true, token, user: userSafe });
});

// GET /api/auth/me (verify token)
router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const { password_hash, ...userSafe } = user;
    res.json({ success: true, user: userSafe });
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

module.exports = router;
