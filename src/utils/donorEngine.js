// src/utils/donorEngine.js
// NutriMatch Phase 2 — Donor Intelligence, Transparency & Impact Calculation Engine

import { VILLAGES, DEFICIENCY_RECORDS, NGO_ACTIVITIES, DONOR_PLEDGES } from '../data/mockData.js';
import { calculateAidCoverage } from './aidGapEngine.js';
import { buildNutritionProfile } from './nutritionProfileEngine.js';

/**
 * Calculates transparent nutritional reach and impact per INR pledged
 */
export function calculateDonorImpact(amountINR, targetDeficiencyType = 'iron') {
  const numericAmount = parseFloat(amountINR) || 0;
  if (numericAmount <= 0) {
    return {
      amountINR: 0,
      totalChildrenReached: 0,
      estimatedChildDays: 0,
      impactNotice: 'Enter a valid pledge amount to calculate nutritional impact.',
    };
  }

  // Cost estimates: ~₹10 per child per day for targeted micronutrient fortification/supplementation
  const estimatedChildDays = Math.round(numericAmount / 10);
  const totalChildrenReached = Math.round(estimatedChildDays / 30); // 30-day intervention cycle

  return {
    amountINR: numericAmount,
    totalChildrenReached: Math.max(totalChildrenReached, 1),
    estimatedChildDays,
    impactNotice: `₹${numericAmount.toLocaleString()} pledge provides approximately ${estimatedChildDays} child-days of ${targetDeficiencyType} nutrition support (~${totalChildrenReached} children for 1 month).`,
    populationGroup: 'children_6_59_months',
    cautiousReachStatement: 'All impact figures represent estimated intervention reach based on standard ICMR-NIN supplementation unit costs.',
  };
}

/**
 * Matches donor pledge to high-priority village with an identified aid gap
 */
export function matchPledgeToPriorityNeed(amountINR, preferredDeficiency = null) {
  const criticalVillages = VILLAGES.map(v => {
    const vDefs = DEFICIENCY_RECORDS.filter(d => d.village_id === v.id);
    const gapAnalysis = calculateAidCoverage(v, vDefs, NGO_ACTIVITIES, DONOR_PLEDGES);
    const profile = buildNutritionProfile(v, vDefs, 'district');

    return {
      village: v,
      profile,
      gapAnalysis,
      isCritical: gapAnalysis.quadrant === 'CRITICAL',
    };
  }).sort((a, b) => b.profile.priorityScore - a.profile.priorityScore);

  const topMatch = criticalVillages.find(v => v.isCritical) || criticalVillages[0];
  const targetDeficiency = preferredDeficiency || topMatch.profile.indicators[0]?.deficiency_type || 'iron';
  const impact = calculateDonorImpact(amountINR, targetDeficiency);

  return {
    matchedVillage: {
      id: topMatch.village.id,
      name: topMatch.village.name,
      district: topMatch.village.district,
      state: topMatch.village.state,
      priorityScore: topMatch.profile.priorityScore,
      priorityCategory: topMatch.profile.priorityCategory,
      quadrant: topMatch.gapAnalysis.quadrant,
      aidGapPct: topMatch.gapAnalysis.aidGapPct,
    },
    targetDeficiency,
    populationGroup: 'children_6_59_months',
    evidenceCitation: {
      sourceAuthority: topMatch.profile.confidenceMetrics ? 'Ministry of Health and Family Welfare (MoHFW) / IIPS' : 'NFHS-5',
      surveyYear: '2019-2021',
      confidence: topMatch.profile.confidenceMetrics?.overallConfidence || 'MEDIUM',
      disclaimer: topMatch.profile.disclaimer,
    },
    impact,
  };
}
