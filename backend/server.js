require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/villages', require('./routes/villages'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/pledges', require('./routes/pledges'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'NutriMatch API' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`NutriMatch API running on port ${PORT}`));
