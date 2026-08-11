const express = require('express');
const router = express.Router();

let activities = [
  { id: 'a1', ngo_id: 'ngo1', village_id: 'v1', item_distributed: 'Fortified Rice (50kg bags)', deficiency_addressed: 'iron', start_date: '2024-01-10', end_date: null, status: 'active' },
  { id: 'a2', ngo_id: 'ngo1', village_id: 'v2', item_distributed: 'Vitamin A Capsules', deficiency_addressed: 'vitamin_a', start_date: '2024-02-01', end_date: null, status: 'active' },
  { id: 'a3', ngo_id: 'ngo2', village_id: 'v1', item_distributed: 'Iron-Folic Acid Tablets', deficiency_addressed: 'iron', start_date: '2024-01-15', end_date: null, status: 'active' },
];

// GET /api/activities?village_id=v1
router.get('/', (req, res) => {
  const { village_id, ngo_id, status } = req.query;
  let result = activities;
  if (village_id) result = result.filter(a => a.village_id === village_id);
  if (ngo_id) result = result.filter(a => a.ngo_id === ngo_id);
  if (status) result = result.filter(a => a.status === status);

  // Overlap detection
  const overlapMap = {};
  result.filter(a => a.status === 'active').forEach(a => {
    const key = `${a.village_id}-${a.deficiency_addressed}`;
    if (!overlapMap[key]) overlapMap[key] = [];
    overlapMap[key].push(a.ngo_id);
  });
  const overlaps = Object.entries(overlapMap)
    .filter(([_, ngos]) => ngos.length > 1)
    .map(([key, ngos]) => ({ key, ngos }));

  res.json({ success: true, data: result, overlaps });
});

// POST /api/activities
router.post('/', (req, res) => {
  const { ngo_id, village_id, item_distributed, deficiency_addressed, start_date, notes } = req.body;
  if (!village_id || !item_distributed || !deficiency_addressed || !start_date) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  const newActivity = {
    id: `a_${Date.now()}`,
    ngo_id: ngo_id || 'anonymous',
    village_id, item_distributed, deficiency_addressed, start_date,
    end_date: null, status: 'active', notes: notes || '',
  };
  activities.push(newActivity);
  res.status(201).json({ success: true, data: newActivity });
});

// PATCH /api/activities/:id/complete
router.patch('/:id/complete', (req, res) => {
  const activity = activities.find(a => a.id === req.params.id);
  if (!activity) return res.status(404).json({ success: false, error: 'Activity not found' });
  activity.status = 'completed';
  activity.end_date = new Date().toISOString().split('T')[0];
  res.json({ success: true, data: activity });
});

module.exports = router;
