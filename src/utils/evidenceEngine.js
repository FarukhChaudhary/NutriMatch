// src/utils/evidenceEngine.js
// NutriMatch Phase 2 — Evidence Foundation & Confidence Calculation Engine

export const SUPPORTED_GEOGRAPHY_LEVELS = ['country', 'state', 'district', 'block', 'village'];

export const SUPPORTED_POPULATION_GROUPS = [
  'children_0_5',
  'children_6_59_months',
  'school_age_children',
  'adolescent_girls',
  'pregnant_women',
  'lactating_women',
  'general_population',
];

export const SCIENTIFIC_INDICATORS = {
  CHILD_ANAEMIA: {
    code: 'NFHS5_CHILD_ANAEMIA',
    name: 'Anaemia Prevalence in Children (6-59 months)',
    scientificName: 'Children age 6-59 months who are anaemic (<11.0 g/dl)',
    targetNutrientCategory: 'iron',
  },
  WOMEN_ANAEMIA: {
    code: 'NFHS5_WOMEN_ANAEMIA',
    name: 'Anaemia Prevalence in Non-Pregnant Women (15-49 years)',
    scientificName: 'Non-pregnant women age 15-49 years who are anaemic (<12.0 g/dl)',
    targetNutrientCategory: 'folate',
  },
  CHILD_STUNTING: {
    code: 'NFHS5_CHILD_STUNTED',
    name: 'Stunting Prevalence (Height-for-Age)',
    scientificName: 'Children under 5 years who are stunted (height-for-age <-2 SD)',
    targetNutrientCategory: 'zinc',
  },
  CHILD_WASTING: {
    code: 'NFHS5_CHILD_WASTED',
    name: 'Wasting Prevalence (Weight-for-Height)',
    scientificName: 'Children under 5 years who are severely wasted (weight-for-height <-3 SD)',
    targetNutrientCategory: 'zinc',
  },
  VITAMIN_A_SUPP: {
    code: 'NFHS5_VITAMIN_A_SUPP',
    name: 'Vitamin A Supplementation Deficit Rate',
    scientificName: 'Children age 9-35 months lacking Vitamin A supplementation dose',
    targetNutrientCategory: 'vitamin_a',
  },
  IODIZED_SALT: {
    code: 'NFHS5_IODIZED_SALT',
    name: 'Inadequate Iodised Salt Household Coverage Rate',
    scientificName: 'Households consuming non-iodised or inadequately iodised salt (<15 ppm)',
    targetNutrientCategory: 'iodine',
  },
};

/**
 * Calculates separated confidence metrics and overall confidence rating
 */
export function calculateEvidenceConfidence({
  sourceAuthority,
  geographyLevel,
  targetGeographyLevel = 'village',
  populationGroup,
  targetPopulationGroup = 'children_6_59_months',
  surveyYear,
}) {
  // 1. Source Reliability
  const authoritativeSources = ['MoHFW', 'IIPS', 'NFHS-5', 'ICMR-NIN', 'WHO', 'UNICEF', 'FSSAI', 'Census of India'];
  const sourceReliability = authoritativeSources.some(s => sourceAuthority.includes(s)) ? 'HIGH' : 'MEDIUM';

  // 2. Geographic Specificity
  let geographySpecificity = 'HIGH';
  if (geographyLevel === 'district' && targetGeographyLevel === 'village') {
    geographySpecificity = 'MEDIUM';
  } else if (geographyLevel === 'state' || geographyLevel === 'country') {
    geographySpecificity = 'LOW';
  }

  // 3. Population Specificity
  let populationSpecificity = 'HIGH';
  if (populationGroup !== targetPopulationGroup) {
    if (populationGroup === 'general_population') {
      populationSpecificity = 'LOW';
    } else {
      populationSpecificity = 'MEDIUM';
    }
  }

  // 4. Data Recency
  const currentYear = 2026;
  const numericYear = parseInt(surveyYear?.slice(0, 4) || '2021', 10);
  const ageInYears = currentYear - numericYear;
  let dataRecency = 'HIGH';
  if (ageInYears > 7) {
    dataRecency = 'LOW';
  } else if (ageInYears > 3) {
    dataRecency = 'MEDIUM';
  }

  // 5. Overall Confidence (Lowest score caps overall score to avoid overclaiming)
  const ratings = [sourceReliability, geographySpecificity, populationSpecificity, dataRecency];
  let overallConfidence = 'HIGH';
  if (ratings.includes('LOW')) {
    overallConfidence = 'LOW';
  } else if (ratings.includes('MEDIUM')) {
    overallConfidence = 'MEDIUM';
  }

  return {
    sourceReliability,
    geographySpecificity,
    populationSpecificity,
    dataRecency,
    overallConfidence,
  };
}

/**
 * Generates mandatory scientific geographic disclaimers
 */
export function getGeographicDisclaimer(geographyLevel, targetGeographyLevel = 'village') {
  if (geographyLevel === 'district' && targetGeographyLevel === 'village') {
    return 'Village-level direct measurement unavailable. This insight uses the latest available district-level evidence.';
  }
  if (geographyLevel === 'state' && targetGeographyLevel !== 'state') {
    return 'Village/District-level direct measurement unavailable. This insight uses state-level survey evidence.';
  }
  return null;
}

/**
 * Generates structured evidence record object
 */
export function createEvidenceRecord({
  indicatorCode,
  indicatorName,
  value,
  unit = '%',
  geographyLevel = 'district',
  geographyId,
  geographyName,
  sourceGeography,
  populationGroup = 'children_6_59_months',
  sourceAuthority = 'Ministry of Health and Family Welfare (MoHFW) / IIPS',
  sourceDocument = 'NFHS-5 District Factsheet',
  surveyYear = '2019-2021',
  sourceUrl = 'https://rchiips.org/nfhs/',
  evidenceType = 'survey',
}) {
  const confidenceMetrics = calculateEvidenceConfidence({
    sourceAuthority,
    geographyLevel,
    targetGeographyLevel: 'village',
    populationGroup,
    surveyYear,
  });

  const disclaimer = getGeographicDisclaimer(geographyLevel, 'village');

  return {
    id: `ev-${geographyId}-${indicatorCode}`,
    indicator_code: indicatorCode,
    indicator_name: indicatorName,
    value,
    unit,
    geography_level: geographyLevel,
    geography_id: geographyId,
    geography_name: geographyName,
    source_geography: sourceGeography,
    population_group: populationGroup,
    source_authority: sourceAuthority,
    source_document: sourceDocument,
    survey_year: surveyYear,
    source_url: sourceUrl,
    evidence_type: evidenceType,
    disclaimer,

    // camelCase
    ...confidenceMetrics,

    // snake_case DB columns
    source_reliability: confidenceMetrics.sourceReliability,
    geography_specificity: confidenceMetrics.geographySpecificity,
    population_specificity: confidenceMetrics.populationSpecificity,
    data_recency: confidenceMetrics.dataRecency,
    overall_confidence: confidenceMetrics.overallConfidence,
  };
}
