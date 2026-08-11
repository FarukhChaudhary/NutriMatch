const express = require('express');
const router = express.Router();

let pledges = [
  { id: 'p1', donor_id: 'donor1', village_id: 'v4', recommendation_id: 'r1', amount_inr: 5000, item_description: null, date: '2024-03-15', status: 'pending' },
  { id: 'p2', donor_id: 'donor1', village_id: 'v2', recommendation_id: 'r5', amount_inr: null, item_description: 'Vitamin A Capsules (500 units)', date: '2024-03-20', status: 'fulfilled' },
];

// GET /api/pledges
router.get('/', (req, res) => {
  const { donor_id, village_id, status } = req.query;
  let result = pledges;
  if (donor_id) result = result.filter(p => p.donor_id === donor_id);
  if (village_id) result = result.filter(p => p.village_id === village_id);
  if (status) result = result.filter(p => p.status === status);
  res.json({ success: true, data: result });
});

// POST /api/pledges
router.post('/', (req, res) => {
  const { donor_id, village_id, recommendation_id, amount_inr, item_description } = req.body;
  if (!village_id || (!amount_inr && !item_description)) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  const newPledge = {
    id: `p_${Date.now()}`,
    donor_id: donor_id || 'anonymous',
    village_id, recommendation_id,
    amount_inr: amount_inr ? parseFloat(amount_inr) : null,
    item_description: item_description || null,
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
  };
  pledges.push(newPledge);

  // Compute impact estimate
  const estimatedChildren = amount_inr ? Math.round((parseFloat(amount_inr) / 250) * 30) : 30;

  res.status(201).json({ success: true, data: newPledge, impact: { estimated_children: estimatedChildren } });
});

module.exports = router;
