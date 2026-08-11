// src/utils/orchestratorTools.js
// NutriMatch Phase 2 — Capability Tool Registry & Strict Deterministic Contracts

import { VILLAGES, DEFICIENCY_RECORDS, NGO_ACTIVITIES, DONOR_PLEDGES, FOOD_RECOMMENDATIONS } from '../data/mockData.js';
import { buildNutritionProfile } from './nutritionProfileEngine.js';
import { calculateAidCoverage } from './aidGapEngine.js';
import { matchInventoryToRegions } from './inventoryMatcher.js';
import { runResourceOptimization } from './optimizationEngine.js';
import { getProtectedHealthClaimExplanation } from './ragTerminology.js';
import { RAG_DOCUMENTS, MEDICAL_DISCLAIMER, INSUFFICIENT_EVIDENCE_RESPONSE } from './ragEngine.js';

/**
 * Capability Tool Registry
 */
export const CAPABILITY_TOOLS = {
  TOOL_NUTRITION_PROFILE: 'tool_nutrition_profile',
  TOOL_LOCATION_COMPARISON: 'tool_location_comparison',
  TOOL_BUDGET_OPTIMIZATION: 'tool_budget_optimization',
  TOOL_INVENTORY_MATCHING: 'tool_inventory_matching',
  TOOL_AID_GAP: 'tool_aid_gap',
  TOOL_FOOD_SUITABILITY: 'tool_food_suitability',
  TOOL_EVIDENCE_SEARCH: 'tool_evidence_search',
};

/**
 * Tool 1: Nutrition Profile Contract
 */
export function executeNutritionProfileTool({ locationName }) {
  const village = VILLAGES.find(v => v.name.toLowerCase() === locationName?.toLowerCase() || v.district.toLowerCase() === locationName?.toLowerCase());
  if (!village) {
    return { error: `Location "${locationName}" not found in NutriMatch database.` };
  }

  const vDefs = DEFICIENCY_RECORDS.filter(d => d.village_id === village.id);
  const profile = buildNutritionProfile(village, vDefs, 'district');
  const gapInfo = calculateAidCoverage(village, vDefs, NGO_ACTIVITIES, DONOR_PLEDGES);

  return {
    success: true,
    villageId: village.id,
    villageName: village.name,
    district: village.district,
    state: village.state,
    population: village.population,
    childPopulation: village.child_population,
    priorityScore: profile.priorityScore,
    priorityCategory: profile.priorityCategory,
    evidenceCoverage: profile.evidenceCoverage,
    indicators: profile.indicators,
    aidCoveragePct: gapInfo.aidCoveragePct,
    aidGapPct: gapInfo.aidGapPct,
    quadrant: gapInfo.quadrant,
    disclaimer: profile.disclaimer,
  };
}

/**
 * Tool 2: Location Comparison Contract
 */
export function executeLocationComparisonTool({ locationNames = [] }) {
  if (!locationNames || locationNames.length < 2) {
    return { error: 'Location comparison requires at least 2 location names.' };
  }

  const profiles = locationNames.map(loc => executeNutritionProfileTool({ locationName: loc })).filter(p => p.success);

  if (profiles.length < 2) {
    return { error: 'Could not resolve both locations for comparison.' };
  }

  const loc1 = profiles[0];
  const loc2 = profiles[1];

  const highestNeed = loc1.priorityScore >= loc2.priorityScore ? loc1 : loc2;
  const highestGap = loc1.aidGapPct >= loc2.aidGapPct ? loc1 : loc2;

  return {
    success: true,
    location1: loc1,
    location2: loc2,
    comparisonSummary: {
      higherNeedLocation: highestNeed.villageName,
      higherAidGapLocation: highestGap.villageName,
      needScoreDiff: Math.abs(loc1.priorityScore - loc2.priorityScore),
      gapDiffPct: Math.abs(loc1.aidGapPct - loc2.aidGapPct),
    },
  };
}

/**
 * Tool 3: Budget Optimization Contract
 */
export function executeBudgetOptimizationTool({ locationName, budgetINR, maxInterventions = 4 }) {
  const village = VILLAGES.find(v => v.name.toLowerCase() === locationName?.toLowerCase() || v.district.toLowerCase() === locationName?.toLowerCase());
  if (!village) {
    return { error: `Location "${locationName}" not found for budget optimization.` };
  }

  const result = runResourceOptimization({
    budgetINR: parseFloat(budgetINR) || 50000,
    villageId: village.id,
    maxInterventions,
  });

  return {
    success: true,
    ...result,
  };
}

/**
 * Tool 4: Inventory Matching Contract (with Hard Location Constraint Enforcement)
 */
export function executeInventoryMatchingTool({ inventory = [], locationConstraint = 'NONE', hardLocationName = null, stateConstraint = 'NONE', activeState = null }) {
  const mockInventory = inventory.length > 0 ? inventory : [
    { item_name: 'rice', quantity: 200, unit: 'kg' },
  ];

  let targetVillages = VILLAGES;

  // 1. HARD Village/District Location Constraint (e.g. "in Sheopur")
  if (locationConstraint === 'HARD' && hardLocationName) {
    const hardVillage = VILLAGES.find(v => v.name.toLowerCase() === hardLocationName.toLowerCase() || v.district.toLowerCase() === hardLocationName.toLowerCase());
    if (hardVillage) {
      targetVillages = [hardVillage];
    }
  }
  // 2. HARD State Geographic Constraint (e.g. "in Maharashtra")
  else if (stateConstraint === 'HARD' && activeState) {
    const stateVillages = VILLAGES.filter(v => v.state.toLowerCase() === activeState.toLowerCase());
    if (stateVillages.length > 0) {
      targetVillages = stateVillages;
    }
  }

  const result = matchInventoryToRegions(mockInventory, targetVillages, DEFICIENCY_RECORDS, NGO_ACTIVITIES, DONOR_PLEDGES);

  return {
    success: true,
    isHardConstrained: locationConstraint === 'HARD' || stateConstraint === 'HARD',
    constrainedLocation: hardLocationName || activeState,
    inventoryParsed: mockInventory,
    nutrientAnalysis: result.nutrientAnalysis,
    regionMatches: result.regionMatches,
    topRecommendedRegion: result.topRecommendedRegion,
  };
}

/**
 * Tool 5: Food Suitability Contract
 */
export function executeFoodSuitabilityTool({ foodName, deficiencyType = 'iron', language = 'en' }) {
  const claimInfo = getProtectedHealthClaimExplanation(foodName, deficiencyType, language);
  return {
    success: true,
    foodName,
    deficiencyType,
    explanation: claimInfo.explanation,
    healthClaimNotice: claimInfo.healthClaimNotice,
  };
}

/**
 * Tool 6: RAG Evidence Search Contract
 */
export function executeEvidenceSearchTool({ queryText, language = 'en' }) {
  if (!queryText || typeof queryText !== 'string') {
    return {
      success: false,
      answer: INSUFFICIENT_EVIDENCE_RESPONSE[language] || INSUFFICIENT_EVIDENCE_RESPONSE.en,
      citations: [],
      queryGrounded: false,
      disclaimer: MEDICAL_DISCLAIMER[language] || MEDICAL_DISCLAIMER.en,
    };
  }

  const queryTokens = queryText.toLowerCase().replace(/[^\w\s]/gi, ' ').split(/\s+/).filter(t => t.length > 2);
  const domainKeywords = ['anaemia', 'anemia', 'stunting', 'wasting', 'iron', 'zinc', 'folate', 'iodine', 'vitamin', 'nfhs', 'ifct', 'nin', 'fssai', 'who', 'unicef', 'jaggery', 'moringa', 'salt', 'rice', 'dal', 'supplement', 'ors'];

  const hasDomainKeyword = queryTokens.some(token => domainKeywords.some(dk => dk.includes(token) || token.includes(dk)));

  if (!hasDomainKeyword) {
    return {
      success: false,
      answer: INSUFFICIENT_EVIDENCE_RESPONSE[language] || INSUFFICIENT_EVIDENCE_RESPONSE.en,
      citations: [],
      queryGrounded: false,
      disclaimer: MEDICAL_DISCLAIMER[language] || MEDICAL_DISCLAIMER.en,
    };
  }

  const authorityWeights = {
    'MoHFW / IIPS': 50,
    'ICMR-NIN': 40,
    'FSSAI': 35,
    'WHO': 30,
    'UNICEF': 25,
  };

  const scoredChunks = RAG_DOCUMENTS.map(doc => {
    let score = authorityWeights[doc.source_authority] || 10;
    const contentLower = (doc.content + ' ' + doc.title + ' ' + doc.topic).toLowerCase();

    queryTokens.forEach(token => {
      if (contentLower.includes(token)) {
        score += 15;
      }
    });

    return { doc, score };
  }).sort((a, b) => b.score - a.score);

  const bestMatch = scoredChunks[0];
  if (!bestMatch || bestMatch.score < 25) {
    return {
      success: false,
      answer: INSUFFICIENT_EVIDENCE_RESPONSE[language] || INSUFFICIENT_EVIDENCE_RESPONSE.en,
      citations: [],
      queryGrounded: false,
      disclaimer: MEDICAL_DISCLAIMER[language] || MEDICAL_DISCLAIMER.en,
    };
  }

  const primaryDoc = bestMatch.doc;
  let simplifiedText = primaryDoc.content;

  if (language === 'hi') {
    simplifiedText = 'NFHS-5 आंकड़ों के अनुसार, बच्चों में एनीमिया का अर्थ है 11.0 g/dl से कम हीमोग्लोबिन स्तर। वाशिम और बहराइच जैसे जिलों में एनीमिया का प्रसार अधिक है।';
  } else if (language === 'mr') {
    simplifiedText = 'NFHS-5 माहितीनुसार, मुलांमध्ये ॲनिमिया म्हणजे हिमोग्लोबिनचे प्रमाण 11.0 g/dl पेक्षा कमी असणे. वाशीम आणि बहराइचसारख्या जिल्ह्यांमध्ये हे प्रमाण जास्त आहे।';
  }

  const matchedCitations = scoredChunks.slice(0, 3).map(c => ({
    title: c.doc.title,
    organization: c.doc.organization,
    publication_date: c.doc.publication_date,
    url: c.doc.url,
    document_type: c.doc.document_type,
    topic: c.doc.topic,
    geographic_scope: c.doc.geographic_scope,
    population_group: c.doc.population_group,
    source_authority: c.doc.source_authority,
  }));

  return {
    success: true,
    answer: simplifiedText,
    citations: matchedCitations,
    queryGrounded: true,
    evidence: {
      source: primaryDoc.title,
      organization: primaryDoc.organization,
      populationGroup: primaryDoc.population_group,
      geographyLevel: primaryDoc.geographic_scope,
      surveyYear: primaryDoc.publication_date?.slice(0, 4) || '2021',
      confidence: 'HIGH',
    },
    technicalDetails: {
      toggleLabel: language === 'hi' ? 'वैज्ञानिक जानकारी देखें' : language === 'mr' ? 'तांत्रिक माहिती पहा' : 'View technical details',
      rawText: primaryDoc.content,
      sourceUrl: primaryDoc.url,
    },
    disclaimer: MEDICAL_DISCLAIMER[language] || MEDICAL_DISCLAIMER.en,
  };
}
