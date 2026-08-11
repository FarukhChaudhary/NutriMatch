const express = require('express');
const router = express.Router();

// Weighted scoring formula:
// score = (nutrient_match × 0.40) + (local_availability × 0.25) + (cost × 0.25) + (shelf_life × 0.10)
function computeScore(rec) {
  return (
    rec.nutrient_match_score * 0.40 +
    rec.local_availability_score * 0.25 +
    rec.cost_score * 0.25 +
    rec.shelf_life_score * 0.10
  );
}

const FOOD_RECOMMENDATIONS = [
  { id: 'r1', deficiency_type: 'iron', food_name: 'Fortified Rice', nutrient_match_score: 9.2, local_availability_score: 8.5, cost_score: 9.0, shelf_life_score: 8.0, citation: 'WHO. Micronutrient fortification of foods (2023).', description: 'Iron-fortified rice distributed through PDS.' },
  { id: 'r2', deficiency_type: 'iron', food_name: 'Jaggery (Gur)', nutrient_match_score: 7.5, local_availability_score: 9.5, cost_score: 9.2, shelf_life_score: 8.5, citation: 'ICMR. Nutritive Value of Indian Foods (2017).', description: 'Traditional jaggery contains non-heme iron.' },
  { id: 'r3', deficiency_type: 'iron', food_name: 'Dried Lentils (Masoor Dal)', nutrient_match_score: 8.0, local_availability_score: 8.8, cost_score: 8.7, shelf_life_score: 9.2, citation: 'ICMR. Nutritive Value of Indian Foods (2017).', description: 'High-iron legume with long shelf life.' },
  { id: 'r5', deficiency_type: 'vitamin_a', food_name: 'Vitamin A Supplementation Capsules', nutrient_match_score: 10.0, local_availability_score: 7.0, cost_score: 8.5, shelf_life_score: 9.5, citation: 'WHO. Vitamin A supplementation (2011).', description: 'Biannual Vitamin A supplementation through ASHA workers.' },
  { id: 'r6', deficiency_type: 'vitamin_a', food_name: 'Sweet Potato (Orange Flesh)', nutrient_match_score: 9.0, local_availability_score: 7.5, cost_score: 8.8, shelf_life_score: 6.0, citation: 'Low J.W. et al. HarvestPlus (2017).', description: 'Orange-fleshed sweet potato with high beta-carotene.' },
  { id: 'r9', deficiency_type: 'zinc', food_name: 'Zinc-ORS Supplementation', nutrient_match_score: 9.8, local_availability_score: 7.5, cost_score: 8.2, shelf_life_score: 9.8, citation: 'WHO. Zinc supplementation (2023).', description: 'Zinc-ORS combination tablets for children under 5.' },
  { id: 'r12', deficiency_type: 'iodine', food_name: 'Iodised Salt (Double Fortified)', nutrient_match_score: 10.0, local_availability_score: 9.2, cost_score: 9.5, shelf_life_score: 9.8, citation: 'UNICEF/WHO/ICCIDD. Assessment of Iodine Deficiency Disorders (2007).', description: 'Double-fortified iodised salt.' },
  { id: 'r14', deficiency_type: 'folate', food_name: 'Folic Acid Tablets (IFA Programme)', nutrient_match_score: 10.0, local_availability_score: 8.0, cost_score: 9.2, shelf_life_score: 9.5, citation: 'MoHFW. Weekly Iron and Folic Acid Supplementation Programme.', description: 'Weekly IFA tablets through WIFS programme.' },
];

const DEFICIENCY_RECORDS = [
  { id: 'd1', village_id: 'v1', deficiency_type: 'iron', severity: 'severe', prevalence_pct: 71.2 },
  { id: 'd2', village_id: 'v1', deficiency_type: 'zinc', severity: 'moderate', prevalence_pct: 43.5 },
  { id: 'd5', village_id: 'v2', deficiency_type: 'vitamin_a', severity: 'severe', prevalence_pct: 68.4 },
  { id: 'd6', village_id: 'v2', deficiency_type: 'iron', severity: 'severe', prevalence_pct: 65.1 },
  { id: 'd9', village_id: 'v3', deficiency_type: 'folate', severity: 'severe', prevalence_pct: 74.3 },
  { id: 'd13', village_id: 'v4', deficiency_type: 'iron', severity: 'severe', prevalence_pct: 78.6 },
  { id: 'd18', village_id: 'v5', deficiency_type: 'zinc', severity: 'severe', prevalence_pct: 70.2 },
  { id: 'd24', village_id: 'v7', deficiency_type: 'iodine', severity: 'severe', prevalence_pct: 73.1 },
];

// GET /api/recommendations?village_id=v1
router.get('/', (req, res) => {
  const { village_id, deficiency_type } = req.query;

  let recs = FOOD_RECOMMENDATIONS;

  if (village_id) {
    const villageDefs = DEFICIENCY_RECORDS.filter(d => d.village_id === village_id);
    const defTypes = villageDefs.map(d => d.deficiency_type);
    recs = recs.filter(r => defTypes.includes(r.deficiency_type));

    // Apply severity weighting
    recs = recs.map(r => {
      const defRecord = villageDefs.find(d => d.deficiency_type === r.deficiency_type);
      const severityWeight = defRecord?.severity === 'severe' ? 1.2 : defRecord?.severity === 'moderate' ? 1.0 : 0.8;
      return { ...r, computedScore: computeScore(r) * severityWeight };
    }).sort((a, b) => b.computedScore - a.computedScore).slice(0, 3);
  }

  if (deficiency_type) {
    recs = recs.filter(r => r.deficiency_type === deficiency_type);
  }

  res.json({ success: true, data: recs });
});

// GET /api/recommendations/:id
router.get('/:id', (req, res) => {
  const rec = FOOD_RECOMMENDATIONS.find(r => r.id === req.params.id);
  if (!rec) return res.status(404).json({ success: false, error: 'Recommendation not found' });
  res.json({ success: true, data: { ...rec, computedScore: computeScore(rec) } });
});

module.exports = router;
