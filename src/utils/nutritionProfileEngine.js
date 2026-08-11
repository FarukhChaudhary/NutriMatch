// src/utils/nutritionProfileEngine.js
// NutriMatch Phase 2 — Nutrition Profile Engine & Priority Scoring

import { NUTRITION_PRIORITY_CONFIG } from '../config/scoringConfig.js';
import { calculateEvidenceConfidence, getGeographicDisclaimer, SCIENTIFIC_INDICATORS } from './evidenceEngine.js';

/**
 * Calculates evidence coverage for a region based on available vs tracked indicators
 */
export function calculateEvidenceCoverage(availableDeficiencyTypes) {
  const tracked = NUTRITION_PRIORITY_CONFIG.standardTrackedIndicators;
  const available = tracked.filter(t => availableDeficiencyTypes.includes(t));
  const unavailable = tracked.filter(t => !availableDeficiencyTypes.includes(t));
  const coveragePct = Math.round((available.length / tracked.length) * 100);

  return {
    coveragePct,
    availableIndicators: available,
    unavailableIndicators: unavailable,
  };
}

/**
 * Calculates transparent Nutrition Priority Score (0-100) and rationale breakdown
 */
export function calculateNutritionPriorityScore(village, deficiencyRecords) {
  if (!deficiencyRecords || deficiencyRecords.length === 0) {
    return {
      score: 0,
      category: 'LOW',
      breakdown: { reason: 'No deficiency records available' },
    };
  }

  const { weights, severityMultiplier, categoryThresholds } = NUTRITION_PRIORITY_CONFIG;

  // Average prevalence %
  const avgPrevalence = deficiencyRecords.reduce((sum, d) => sum + d.prevalence_pct, 0) / deficiencyRecords.length;
  const prevalenceScore = Math.min(avgPrevalence, 100);

  // Highest & average severity
  const severityScores = deficiencyRecords.map(d => (severityMultiplier[d.severity] || 0.5) * 100);
  const avgSeverityScore = severityScores.reduce((sum, s) => sum + s, 0) / severityScores.length;

  // Population affected ratio (child ratio of total)
  const childRatio = village.child_population / (village.population || 1);
  const populationScore = Math.min(childRatio * 400, 100); // Normalized scale

  // Recency score (2021 = ~80/100 recency score)
  const latestYear = Math.max(...deficiencyRecords.map(d => d.year || 2021));
  const recencyScore = Math.max(100 - (2026 - latestYear) * 4, 50);

  // Confidence score
  const confidenceScore = 85; // High/Medium survey confidence

  // Weighted Total Score
  const rawScore =
    prevalenceScore * weights.prevalence +
    avgSeverityScore * weights.severity +
    populationScore * weights.populationAffected +
    recencyScore * weights.recency +
    confidenceScore * weights.confidence;

  const score = Math.round(Math.min(Math.max(rawScore, 0), 100));

  let category = 'LOW';
  if (score >= categoryThresholds.HIGH) {
    category = 'HIGH';
  } else if (score >= categoryThresholds.MODERATE) {
    category = 'MODERATE';
  }

  // Top priorities
  const sortedDeficiencies = [...deficiencyRecords].sort((a, b) => b.prevalence_pct - a.prevalence_pct);
  const topPriority = sortedDeficiencies[0];

  return {
    score,
    category,
    breakdown: {
      prevalenceContribution: Math.round(prevalenceScore * weights.prevalence),
      severityContribution: Math.round(avgSeverityScore * weights.severity),
      populationContribution: Math.round(populationScore * weights.populationAffected),
      recencyContribution: Math.round(recencyScore * weights.recency),
      confidenceContribution: Math.round(confidenceScore * weights.confidence),
      topDeficiency: topPriority?.deficiency_type,
      topPrevalence: topPriority?.prevalence_pct,
      explanation: `Priority score ${score}/100 generated from ${avgPrevalence.toFixed(1)}% average prevalence, ${topPriority?.severity} top severity, and ${village.child_population} vulnerable children.`,
    },
  };
}

/**
 * Builds full unified Nutrition Profile for a village/region
 */
export function buildNutritionProfile(village, deficiencyRecords, sourceGeographyLevel = 'district') {
  const availableTypes = deficiencyRecords.map(d => d.deficiency_type);
  const coverage = calculateEvidenceCoverage(availableTypes);
  const priorityInfo = calculateNutritionPriorityScore(village, deficiencyRecords);

  const confidenceMetrics = calculateEvidenceConfidence({
    sourceAuthority: 'Ministry of Health and Family Welfare (MoHFW) / IIPS',
    geographyLevel: sourceGeographyLevel,
    targetGeographyLevel: 'village',
    populationGroup: 'children_6_59_months',
    surveyYear: '2019-2021',
  });

  const disclaimer = getGeographicDisclaimer(sourceGeographyLevel, 'village');

  const indicators = deficiencyRecords.map(d => ({
    ...d,
    scientificName: SCIENTIFIC_INDICATORS[d.deficiency_type.toUpperCase()]?.scientificName || `${d.deficiency_type} prevalence`,
    populationGroup: 'children_6_59_months',
    confidence: confidenceMetrics.overallConfidence,
  }));

  return {
    villageId: village.id,
    villageName: village.name,
    district: village.district,
    state: village.state,
    population: village.population,
    childPopulation: village.child_population,
    geographyLevel: 'village',
    sourceGeographyLevel: sourceGeographyLevel,
    indicators,
    priorityScore: priorityInfo.score,
    priorityCategory: priorityInfo.category,
    priorityBreakdown: priorityInfo.breakdown,
    evidenceCoverage: coverage,
    confidenceMetrics,
    disclaimer,
  };
}
