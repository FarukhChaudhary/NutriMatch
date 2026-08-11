// src/utils/aidGapEngine.js
// NutriMatch Phase 2 — Aid Gap Intelligence & Matrix Classification

import { buildNutritionProfile } from './nutritionProfileEngine.js';

/**
 * Preserves & exposes NGO Overlap Detection (Phase 1 Compatibility)
 */
export function detectNGOOverlaps(ngoActivities) {
  const activeActivities = ngoActivities.filter(a => a.status === 'active');
  const grouped = {};

  activeActivities.forEach(a => {
    const key = `${a.village_id}-${a.deficiency_addressed}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(a);
  });

  // Filter groups with > 1 NGO
  return Object.values(grouped).filter(group => group.length > 1);
}

/**
 * Calculates Aid Coverage %, Aid Gap %, and Matrix Quadrant
 */
export function calculateAidCoverage(village, deficiencyRecords, ngoActivities = [], donorPledges = []) {
  const activeVillageActivities = ngoActivities.filter(
    a => a.village_id === village.id && a.status === 'active'
  );
  const activePledges = donorPledges.filter(
    p => p.village_id === village.id && p.status !== 'cancelled'
  );

  const totalDeficiencies = deficiencyRecords.length;
  if (totalDeficiencies === 0) {
    return {
      aidCoveragePct: 100,
      aidGapPct: 0,
      coveredDeficiencies: [],
      uncoveredDeficiencies: [],
      quadrant: 'OPPORTUNITY',
      quadrantLabel: 'Opportunity',
    };
  }

  // Active deficiencies being addressed by NGOs
  const addressedDeficiencyTypes = new Set(
    activeVillageActivities.map(a => a.deficiency_addressed).filter(Boolean)
  );

  const coveredList = deficiencyRecords.filter(d => addressedDeficiencyTypes.has(d.deficiency_type));
  const uncoveredList = deficiencyRecords.filter(d => !addressedDeficiencyTypes.has(d.deficiency_type));

  const aidCoveragePct = Math.round((coveredList.length / totalDeficiencies) * 100);
  const aidGapPct = 100 - aidCoveragePct;

  // Build profile to get priority score
  const profile = buildNutritionProfile(village, deficiencyRecords, 'district');
  const isHighNeed = profile.priorityScore >= 60 || profile.priorityCategory === 'HIGH';
  const isLowAid = aidCoveragePct < 50;

  let quadrant = 'OPPORTUNITY';
  let quadrantLabel = 'Opportunity';

  if (isHighNeed && isLowAid) {
    quadrant = 'CRITICAL';
    quadrantLabel = 'Critical Need (High Need + Low Aid)';
  } else if (isHighNeed && !isLowAid) {
    quadrant = 'MONITOR';
    quadrantLabel = 'Monitor (High Need + High Aid)';
  } else if (!isHighNeed && isLowAid) {
    quadrant = 'OPPORTUNITY';
    quadrantLabel = 'Opportunity (Low Need + Low Aid)';
  } else {
    quadrant = 'POSSIBLE_OVERALLOCATION';
    quadrantLabel = 'Possible Overallocation (Low Need + High Aid)';
  }

  return {
    villageId: village.id,
    villageName: village.name,
    district: village.district,
    state: village.state,
    priorityScore: profile.priorityScore,
    priorityCategory: profile.priorityCategory,
    aidCoveragePct,
    aidGapPct,
    activeInterventionCount: activeVillageActivities.length,
    activePledgeCount: activePledges.length,
    coveredDeficiencies: coveredList.map(d => d.deficiency_type),
    uncoveredDeficiencies: uncoveredList.map(d => d.deficiency_type),
    quadrant,
    quadrantLabel,
  };
}

/**
 * Builds the complete Aid Gap Matrix across all villages
 */
export function buildAidGapMatrix(villages, deficiencyRecords, ngoActivities = [], donorPledges = []) {
  const matrix = {
    CRITICAL: [],
    MONITOR: [],
    OPPORTUNITY: [],
    POSSIBLE_OVERALLOCATION: [],
  };

  villages.forEach(village => {
    const vDefs = deficiencyRecords.filter(d => d.village_id === village.id);
    const gapAnalysis = calculateAidCoverage(village, vDefs, ngoActivities, donorPledges);
    matrix[gapAnalysis.quadrant].push(gapAnalysis);
  });

  return matrix;
}
