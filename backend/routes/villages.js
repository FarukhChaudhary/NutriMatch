const express = require('express');
const router = express.Router();

// In production these would query PostgreSQL via Sequelize
// For demo they return mock data

const VILLAGES = [
  { id: 'v1', name: 'Washim', district: 'Washim', state: 'Maharashtra', lat: 20.1119, lng: 77.1464, population: 12400, child_population: 2100 },
  { id: 'v2', name: 'Nandurbar', district: 'Nandurbar', state: 'Maharashtra', lat: 21.3666, lng: 74.2433, population: 9800, child_population: 1950 },
  { id: 'v3', name: 'Dholpur', district: 'Dholpur', state: 'Rajasthan', lat: 26.7013, lng: 77.8965, population: 15600, child_population: 3200 },
  { id: 'v4', name: 'Bahraich', district: 'Bahraich', state: 'Uttar Pradesh', lat: 27.5742, lng: 81.5946, population: 18200, child_population: 4100 },
  { id: 'v5', name: 'Sheopur', district: 'Sheopur', state: 'Madhya Pradesh', lat: 25.6667, lng: 76.6833, population: 8900, child_population: 1750 },
  { id: 'v6', name: 'Palghar', district: 'Palghar', state: 'Maharashtra', lat: 19.6967, lng: 72.7697, population: 11300, child_population: 2400 },
  { id: 'v7', name: 'Barmer', district: 'Barmer', state: 'Rajasthan', lat: 25.7521, lng: 71.3967, population: 14100, child_population: 2900 },
  { id: 'v8', name: 'Chandauli', district: 'Chandauli', state: 'Uttar Pradesh', lat: 25.27, lng: 83.27, population: 10500, child_population: 2200 },
];

// GET /api/villages
router.get('/', (req, res) => {
  const { state, severity } = req.query;
  let result = VILLAGES;
  if (state) result = result.filter(v => v.state === state);
  res.json({ success: true, data: result, count: result.length });
});

// GET /api/villages/:id
router.get('/:id', (req, res) => {
  const village = VILLAGES.find(v => v.id === req.params.id);
  if (!village) return res.status(404).json({ success: false, error: 'Village not found' });
  res.json({ success: true, data: village });
});

module.exports = router;
