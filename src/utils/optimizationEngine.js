// src/utils/optimizationEngine.js
// NutriMatch Phase 2 — Deterministic Nutrition-Aware Resource Optimization Engine

import { OPTIMIZATION_CONFIG } from '../config/scoringConfig.js';
import { FOOD_RECOMMENDATIONS, VILLAGES, DEFICIENCY_RECORDS } from '../data/mockData.js';
import { buildNutritionProfile } from './nutritionProfileEngine.js';
import { calculateAidCoverage } from './aidGapEngine.js';

/**
 * Deterministic Resource Optimization Algorithm
 * Solves constrained allocation of budget/inventory to maximize estimated nutritional impact
 */
export function runResourceOptimization({
  budgetINR,
  villageId,
  availableInventory = [],
  maxInterventions = 4,
  populationGroup = 'children_6_59_months',
  customWeights = null,
}) {
  // Input Validation
  if (typeof budgetINR !== 'number' || isNaN(budgetINR) || budgetINR <= 0) {
    throw new Error('Invalid optimization input: budgetINR must be a positive number.');
  }

  const village = VILLAGES.find(v => v.id === villageId);
  if (!village) {
    throw new Error(`Invalid optimization input: villageId "${villageId}" not found.`);
  }

  const vDefs = DEFICIENCY_RECORDS.filter(d => d.village_id === villageId);
  const profile = buildNutritionProfile(village, vDefs, 'district');
  const gapAnalysis = calculateAidCoverage(village, vDefs, [], []);

  const weights = customWeights || OPTIMIZATION_CONFIG.weights;

  // Filter food candidates relevant to village's uncovered deficiency types
  const candidateFoods = FOOD_RECOMMENDATIONS.filter(food =>
    vDefs.some(d => d.deficiency_type === food.deficiency_type)
  );

  // Evaluate candidate items deterministically
  const evaluatedCandidates = candidateFoods.map(food => {
    const defRecord = vDefs.find(d => d.deficiency_type === food.deficiency_type);
    const severityBonus = defRecord?.severity === 'severe' ? 1.25 : defRecord?.severity === 'moderate' ? 1.0 : 0.8;
    const gapBonus = gapAnalysis.uncoveredDeficiencies.includes(food.deficiency_type) ? 1.2 : 1.0;

    // Unit cost estimation
    const estimatedCostPerPackageINR = Math.round((10 - food.cost_score) * 200 + 500);

    const rawScore =
      (food.nutrient_match_score / 10) * weights.nutrientMatch +
      (food.cost_score / 10) * weights.costEfficiency +
      (food.shelf_life_score / 10) * weights.shelfLife +
      (food.local_availability_score / 10) * weights.localAvailability;

    const utilityScore = Math.round(rawScore * 100 * severityBonus * gapBonus);
    const utilityPerINR = utilityScore / estimatedCostPerPackageINR;

    return {
      ...food,
      estimatedCostINR: estimatedCostPerPackageINR,
      utilityScore,
      utilityPerINR,
      severity: defRecord?.severity,
      prevalencePct: defRecord?.prevalence_pct,
    };
  }).sort((a, b) => b.utilityPerINR - a.utilityPerINR);

  // Deterministic Knapsack / Greedy Allocation
  let remainingBudget = budgetINR;
  const selectedInterventions = [];
  const rejectedAlternatives = [];

  for (const candidate of evaluatedCandidates) {
    if (selectedInterventions.length >= maxInterventions) {
      rejectedAlternatives.push({
        food_name: candidate.food_name,
        deficiency_type: candidate.deficiency_type,
        reason: `Exceeded maximum allowed intervention count (${maxInterventions}).`,
      });
      continue;
    }

    if (candidate.estimatedCostINR <= remainingBudget) {
      const allocatedQuantity = Math.floor(remainingBudget / candidate.estimatedCostINR);
      const allocatedCost = allocatedQuantity * candidate.estimatedCostINR;
      remainingBudget -= allocatedCost;

      // Estimate reach using non-clinical cautious terminology
      const estimatedReachChildren = Math.round(allocatedQuantity * 25);
      const projectedCoveragePct = Math.min(Math.round((estimatedReachChildren / village.child_population) * 100), 100);

      selectedInterventions.push({
        food_id: candidate.id,
        food_name: candidate.food_name,
        deficiency_type: candidate.deficiency_type,
        allocatedPackages: allocatedQuantity,
        allocatedCostINR: allocatedCost,
        unitCostINR: candidate.estimatedCostINR,
        utilityScore: candidate.utilityScore,
        citation: candidate.citation,
        estimatedNutritionalContribution: {
          primaryNutrientAddressed: candidate.deficiency_type,
          estimatedReachChildren: estimatedReachChildren,
          projectedInterventionCoveragePct: projectedCoveragePct,
        },
      });
    } else {
      rejectedAlternatives.push({
        food_name: candidate.food_name,
        deficiency_type: candidate.deficiency_type,
        estimatedCostINR: candidate.estimatedCostINR,
        reason: `Exceeded remaining allocation budget of ₹${remainingBudget.toLocaleString()}.`,
      });
    }
  }

  const totalAllocatedINR = budgetINR - remainingBudget;
  const totalEstimatedReach = selectedInterventions.reduce((sum, item) => sum + item.estimatedNutritionalContribution.estimatedReachChildren, 0);

  return {
    villageId: village.id,
    villageName: village.name,
    district: village.district,
    state: village.state,
    totalBudgetINR: budgetINR,
    totalAllocatedINR,
    remainingBudgetINR: remainingBudget,

    // Transparent Optimization Metadata
    objectiveFunction: `Maximize(NutrientMatch * ${weights.nutrientMatch} + CostEfficiency * ${weights.costEfficiency} + ShelfLife * ${weights.shelfLife} + LocalAvailability * ${weights.localAvailability})`,
    constraintsApplied: {
      budgetINR,
      maxInterventions,
      populationGroup,
      geographyLevel: 'village',
    },
    selectedInterventions,
    rejectedAlternatives,
    projectedSummary: {
      totalEstimatedChildrenReach: Math.min(totalEstimatedReach, village.child_population),
      projectedVillageChildCoveragePct: Math.min(Math.round((totalEstimatedReach / village.child_population) * 100), 100),
      terminologyNotice: 'All calculations represent projected intervention coverage and estimated nutritional reach. No clinical cure outcome is claimed.',
    },
  };
}
