// src/config/scoringConfig.js
// Configurable Nutrition Priority Scoring Methodology Parameters

export const NUTRITION_PRIORITY_CONFIG = {
  // Dimension weights (must sum to 1.0)
  weights: {
    prevalence: 0.40,
    severity: 0.25,
    populationAffected: 0.15,
    recency: 0.10,
    confidence: 0.10,
  },

  // Severity multipliers
  severityMultiplier: {
    severe: 1.0,
    moderate: 0.7,
    mild: 0.4,
  },

  // Priority Category Thresholds (out of 100)
  categoryThresholds: {
    HIGH: 70,
    MODERATE: 45,
    LOW: 0,
  },

  // Standard tracked micronutrient indicators
  standardTrackedIndicators: ['iron', 'vitamin_a', 'zinc', 'iodine', 'folate'],
};

export const OPTIMIZATION_CONFIG = {
  // Configurable optimization weights
  weights: {
    nutrientMatch: 0.40,
    costEfficiency: 0.30,
    shelfLife: 0.15,
    localAvailability: 0.15,
  },
  // Default constraint rules
  defaultMinBudgetINR: 500,
  defaultMaxInterventions: 4,
};

