// src/utils/ragEngine.js
// NutriMatch Phase 2 — General-Purpose Natural Language AI Orchestrator & RAG Engine

import { extractEntitiesAndConstraints, createInitialContext } from './orchestratorContext.js';
import {
  executeNutritionProfileTool,
  executeLocationComparisonTool,
  executeBudgetOptimizationTool,
  executeInventoryMatchingTool,
  executeFoodSuitabilityTool,
  executeEvidenceSearchTool,
} from './orchestratorTools.js';
import { VILLAGES, DEFICIENCY_RECORDS, NGO_ACTIVITIES, DONOR_PLEDGES, FOOD_RECOMMENDATIONS } from '../data/mockData.js';
import { TERMINOLOGY_DICTIONARY, getProtectedHealthClaimExplanation } from './ragTerminology.js';

export const MEDICAL_DISCLAIMER = {
  en: 'Notice: This assistant provides public health evidence, recommendation rationale, and policy context based on official data. It does not provide medical diagnosis, individual clinical treatment, or replace healthcare professionals.',
  hi: 'सूचना: यह सहायक आधिकारिक आंकड़ों के आधार पर सार्वजनिक स्वास्थ्य साक्ष्य और नीतिगत संदर्भ प्रदान करता है। यह कोई डॉक्टरी जांच या इलाज प्रदान नहीं करता है।',
  mr: 'सूचना: हा सहाय्यक अधिकृत माहितीच्या आधारे सार्वजनिक आरोग्य पुरावे प्रदान करतो. हा कोणताही वैद्यकीय उपचार प्रदान करत नाही.',
};

export const INSUFFICIENT_EVIDENCE_RESPONSE = {
  en: 'Insufficient evidence in the current knowledge base to provide a reliable answer.',
  hi: 'वर्तमान ज्ञान कोष में विश्वसनीय उत्तर प्रदान करने के लिए पर्याप्त साक्ष्य उपलब्ध नहीं हैं।',
  mr: 'सध्याच्या ज्ञानकोशात विश्वासार्ह उत्तर देण्यासाठी पुरेसा पुरावा उपलब्ध नाही.',
};

export const NO_MATCH_RESPONSE = {
  en: 'No strong match found for the requested inventory and criteria.',
  hi: 'अनुरोधित सामग्री और मापदंडों के लिए कोई मजबूत मिलान नहीं मिला।',
  mr: 'मागणी केलेल्या साहित्यासाठी आणि निकषांसाठी कोणताही योग्य मेळ आढळला नाही।',
};

// Direct dataset chunks export for ES Module & Vite compatibility
export const RAG_DOCUMENTS = [
  {
    id: 'doc-nfhs5-anaemia-01',
    title: 'National Family Health Survey (NFHS-5) 2019-21 District Indicator Guidelines',
    organization: 'Ministry of Health and Family Welfare (MoHFW) / IIPS Mumbai',
    publication_date: '2021-12-01',
    url: 'https://rchiips.org/nfhs/nfhs5.shtml',
    document_type: 'national_survey',
    topic: 'child_anaemia',
    geographic_scope: 'district',
    population_group: 'children_6_59_months',
    source_authority: 'MoHFW / IIPS',
    content: 'According to NFHS-5 (2019-21), child anaemia is defined as hemoglobin level under 11.0 g/dl in children age 6-59 months. Districts such as Washim (71.2%), Bahraich (78.6%), Palghar (69.5%), and Barmer (67.9%) report high anaemia prevalence, requiring targeted dietary fortification and iron-folic acid supplementation.'
  },
  {
    id: 'doc-icmr-nin-ifct-01',
    title: 'Indian Food Composition Tables (IFCT 2017)',
    organization: 'ICMR - National Institute of Nutrition (NIN), Hyderabad',
    publication_date: '2017-01-01',
    url: 'https://ifct2017.github.io',
    document_type: 'food_composition_table',
    topic: 'iron_zinc_folate_composition',
    geographic_scope: 'national',
    population_group: 'general_population',
    source_authority: 'ICMR-NIN',
    content: 'ICMR-NIN IFCT 2017 provides verified micronutrient values for Indian foods per 100g: Code A012 Sugarcane Jaggery (Gur) contains 11.4mg iron; Code B004 Masoor Dal contains 7.6mg iron and 145mcg folate; Code D021 Moringa Leaves contain 28.2mg iron and 11,300mcg Vitamin A (beta-carotene); Code H010 Sesame Seeds contain 7.8mg zinc and 14.6mg iron.'
  },
  {
    id: 'doc-fssai-fortification-01',
    title: 'FSSAI Operational Guidelines on Food Fortification',
    organization: 'Food Safety and Standards Authority of India (FSSAI)',
    publication_date: '2018-08-15',
    url: 'https://fortification.fssai.gov.in',
    document_type: 'regulatory_standard',
    topic: 'food_fortification',
    geographic_scope: 'national',
    population_group: 'general_population',
    source_authority: 'FSSAI',
    content: 'FSSAI standards mandate Fortified Rice Kernels (FRK) to contain 28mg-42.5mg iron per kg. Double Fortified Salt (DFS) provides 30 PPM Iodine and 800-1100 PPM Iron, serving as a cost-effective universal intervention for simultaneous iron and iodine deficiencies without requiring dietary behavior changes.'
  },
  {
    id: 'doc-mohfw-amb-01',
    title: 'Anemia Mukt Bharat (AMB) & WIFS Operational Guidelines',
    organization: 'Ministry of Health and Family Welfare (MoHFW), Govt. of India',
    publication_date: '2018-04-01',
    url: 'https://anemiamuktbharat.info',
    document_type: 'program_guideline',
    topic: 'ifa_supplementation',
    geographic_scope: 'national',
    population_group: 'children_and_adolescents',
    source_authority: 'MoHFW',
    content: 'Under the Anemia Mukt Bharat strategy and WIFS programme, weekly Iron and Folic Acid (IFA) tablets containing 60mg elemental iron and 500mcg Folic Acid are distributed to adolescent girls and women, while pediatric IFA syrup (20mg elemental iron + 100mcg folic acid per ml) is provided to children 6-59 months.'
  },
  {
    id: 'doc-who-zinc-ors-01',
    title: 'WHO Guideline: Zinc Supplementation in Diarrhoea & Malnutrition',
    organization: 'World Health Organization (WHO)',
    publication_date: '2023-03-01',
    url: 'https://www.who.int/health-topics/micronutrients',
    document_type: 'clinical_guideline',
    topic: 'zinc_supplementation',
    geographic_scope: 'global',
    population_group: 'children_0_5',
    source_authority: 'WHO',
    content: 'WHO recommends 20mg daily zinc supplementation for 10-14 days alongside Oral Rehydration Salts (ORS) for children under 5 during diarrhoeal episodes to reduce duration and prevent recurrent stunted growth associated with zinc deficiency.'
  }
];

/**
 * Main General-Purpose Natural Language AI Orchestrator Entrypoint
 */
export function queryRAGKnowledge(queryText, options = {}) {
  const previousContext = options.previousContext || createInitialContext(options.language);
  const { entities, updatedContext } = extractEntitiesAndConstraints(queryText, previousContext);
  const lang = options.language || updatedContext.activeLanguage || 'en';

  if (!queryText || typeof queryText !== 'string' || queryText.trim().length === 0) {
    return {
      explanation: 'Please provide a valid query.',
      answer: 'Please provide a valid query.',
      citations: [],
      queryGrounded: false,
      disclaimer: MEDICAL_DISCLAIMER.en,
      activeContext: updatedContext,
    };
  }

  const queryLower = queryText.toLowerCase();

  // 1. Out-of-Domain Safety Detection
  const outOfDomainTerms = ['cricket', 'football', 'movie', 'actor', 'weather', 'stock market', 'election', 'match yesterday', 'president'];
  const isOutOfDomain = outOfDomainTerms.some(term => queryLower.includes(term));

  if (isOutOfDomain) {
    const scopeMessage = {
      en: "I'm designed to help with nutrition, food aid, donations, and the NutriMatch evidence base. I can't reliably answer that question from the current system.",
      hi: "मैं केवल पोषण, खाद्य सहायता, दान और NutriMatch साक्ष्य डेटाबेस में सहायता के लिए डिज़ाइन किया गया हूँ। मैं इस प्रश्न का उत्तर नहीं दे सकता।",
      mr: "मी पोषण, अन्न मदत, दान आणि NutriMatch पुरावे डेटाबेसमध्ये मदत करण्यासाठी डिझाइन केलेले आहे. मी या प्रश्नाचे उत्तर देऊ शकत नाही.",
    }[lang] || scopeMessage?.en;

    return {
      explanation: scopeMessage,
      answer: scopeMessage,
      citations: [],
      queryGrounded: false,
      sections: null,
      evidence: null,
      technicalDetails: null,
      disclaimer: MEDICAL_DISCLAIMER[lang] || MEDICAL_DISCLAIMER.en,
      activeContext: updatedContext,
    };
  }

  // 2. Task Planning & Tool Selection

  // Task A: Location Comparison (e.g., "Compare Sheopur and Bahraich" or "Which has bigger aid gap?")
  if (entities.locations.length >= 2 || (queryLower.includes('compare') || queryLower.includes('vs') || queryLower.includes('तुलना'))) {
    const locsToCompare = entities.locations.length >= 2 ? entities.locations : updatedContext.activeLocations.length >= 2 ? updatedContext.activeLocations : ['Sheopur', 'Bahraich'];
    const compResult = executeLocationComparisonTool({ locationNames: locsToCompare });

    if (compResult.success) {
      const loc1 = compResult.location1;
      const loc2 = compResult.location2;

      return {
        explanation: lang === 'hi'
          ? `${loc1.villageName} (आवश्यकता स्कोर: ${loc1.priorityScore}, सहायता अंतर: ${loc1.aidGapPct}%) और ${loc2.villageName} (आवश्यकता स्कोर: ${loc2.priorityScore}, सहायता अंतर: ${loc2.aidGapPct}%) की तुलना।`
          : lang === 'mr'
          ? `${loc1.villageName} (गरज स्कोर: ${loc1.priorityScore}, मदत तफावत: ${loc1.aidGapPct}%) आणि ${loc2.villageName} (गरज स्कोर: ${loc2.priorityScore}, मदत तफावत: ${loc2.aidGapPct}%) ची तुलना.`
          : `Comparison between ${loc1.villageName} (Priority: ${loc1.priorityScore}, Aid Gap: ${loc1.aidGapPct}%) and ${loc2.villageName} (Priority: ${loc2.priorityScore}, Aid Gap: ${loc2.aidGapPct}%).`,
        answer: `Comparison between ${loc1.villageName} and ${loc2.villageName}.`,
        citations: [],
        queryGrounded: true,
        sections: {
          recommendedLocations: [
            { location: `${loc1.villageName} (${loc1.district})`, why: `Priority: ${loc1.priorityScore}, Aid Gap: ${loc1.aidGapPct}%`, priorityScore: loc1.priorityScore, aidGapPct: loc1.aidGapPct, quadrant: loc1.quadrant },
            { location: `${loc2.villageName} (${loc2.district})`, why: `Priority: ${loc2.priorityScore}, Aid Gap: ${loc2.aidGapPct}%`, priorityScore: loc2.priorityScore, aidGapPct: loc2.aidGapPct, quadrant: loc2.quadrant },
          ],
          whyThisLocation: `${compResult.comparisonSummary.higherNeedLocation} has higher identified nutrition priority, while ${compResult.comparisonSummary.higherAidGapLocation} exhibits the larger unaddressed aid gap.`,
        },
        evidence: { source: 'NFHS-5 & NutriMatch Deterministic Engine', populationGroup: 'children_6_59_months', geographyLevel: 'district', surveyYear: '2019-2021', confidence: 'MEDIUM' },
        technicalDetails: { toggleLabel: lang === 'hi' ? 'वैज्ञानिक जानकारी देखें' : lang === 'mr' ? 'तांत्रिक माहिती पहा' : 'View technical details', rawFormula: `NeedDiff = ${compResult.comparisonSummary.needScoreDiff}, GapDiff = ${compResult.comparisonSummary.gapDiffPct}%` },
        disclaimer: MEDICAL_DISCLAIMER[lang] || MEDICAL_DISCLAIMER.en,
        activeContext: updatedContext,
      };
    }
  }

  // Task B: Budget Optimization within Context / Explicit Location (e.g. "I have ₹50,000" or "How to spend ₹50,000 in Sheopur?")
  if (updatedContext.activeBudget && updatedContext.activeLocation) {
    const optResult = executeBudgetOptimizationTool({
      locationName: updatedContext.activeLocation,
      budgetINR: updatedContext.activeBudget,
    });

    if (optResult.success) {
      return {
        explanation: lang === 'hi'
          ? `${optResult.villageName} में ₹${optResult.totalBudgetINR.toLocaleString()} के बजट से लगभग ${optResult.projectedSummary.totalEstimatedChildrenReach} बच्चों तक पोषण सहायता पहुँचाने का अनुमान है।`
          : lang === 'mr'
          ? `${optResult.villageName} मध्ये ₹${optResult.totalBudgetINR.toLocaleString()} बजेटमधून सुमारे ${optResult.projectedSummary.totalEstimatedChildrenReach} मुलांपर्यंत पोषण मदत पोहोचेल.`
          : `Allocating ₹${optResult.totalBudgetINR.toLocaleString()} in ${optResult.villageName} estimates reaching ~${optResult.projectedSummary.totalEstimatedChildrenReach} vulnerable children.`,
        answer: `Budget optimization for ₹${optResult.totalBudgetINR} in ${optResult.villageName}.`,
        citations: [],
        queryGrounded: true,
        sections: {
          whyThisLocation: `Optimized specifically for ${optResult.villageName} based on identified micronutrient gaps and package cost efficiency.`,
          estimatedReach: { beneficiaries: optResult.projectedSummary.totalEstimatedChildrenReach, unitLabel: 'children reached (projected)' },
          whatFoodProvides: `Selected optimal items: ${optResult.selectedInterventions.map(i => `${i.food_name} (${i.allocatedPackages} pkgs)`).join(', ')}.`,
          importantLimitation: optResult.projectedSummary.terminologyNotice,
        },
        evidence: { source: 'ICMR-NIN & NutriMatch Deterministic Knapsack Optimizer', populationGroup: 'children_6_59_months', geographyLevel: 'village', surveyYear: '2026', confidence: 'HIGH' },
        technicalDetails: { toggleLabel: lang === 'hi' ? 'वैज्ञानिक जानकारी देखें' : lang === 'mr' ? 'तांत्रिक माहिती पहा' : 'View technical details', rawFormula: optResult.objectiveFunction, selectedItems: optResult.selectedInterventions },
        disclaimer: MEDICAL_DISCLAIMER[lang] || MEDICAL_DISCLAIMER.en,
        activeContext: updatedContext,
      };
    }
  }

  // Task C: Location-Specific Recommendation (HARD Location Constraint e.g., "I want to donate in Sheopur" or "Tell me about Sheopur")
  if (updatedContext.locationConstraint === 'HARD' && updatedContext.activeLocation) {
    const profile = executeNutritionProfileTool({ locationName: updatedContext.activeLocation });

    if (profile.success) {
      const matchResult = executeInventoryMatchingTool({
        inventory: updatedContext.activeInventory,
        locationConstraint: 'HARD',
        hardLocationName: updatedContext.activeLocation,
      });

      return {
        explanation: lang === 'hi'
          ? `${profile.villageName} (${profile.district}) के लिए अनुशंसित हस्तक्षेप: प्राथमिक कमी - ${profile.indicators[0]?.deficiency_type || 'Iron'}।`
          : lang === 'mr'
          ? `${profile.villageName} (${profile.district}) साठी शिफारस केलेले हस्तक्षेप: प्राथमिक कमतरता - ${profile.indicators[0]?.deficiency_type || 'Iron'}.`
          : `For ${profile.villageName} (${profile.district}), the primary identified nutrition gap is ${profile.indicators[0]?.deficiency_type || 'iron'} (Priority Score: ${profile.priorityScore}/100).`,
        answer: `Nutrition profile and recommendations for ${profile.villageName}.`,
        citations: [],
        queryGrounded: true,
        sections: {
          recommendedLocations: [
            { location: `${profile.villageName}, ${profile.district} (${profile.state})`, why: `Priority: ${profile.priorityScore}/100, Aid Gap: ${profile.aidGapPct}%`, priorityScore: profile.priorityScore, aidGapPct: profile.aidGapPct, quadrant: profile.quadrant },
          ],
          whyThisLocation: `Searched strictly within ${profile.villageName} as specified by your location constraint.`,
          whatFoodProvides: `Top food recommendation: ${FOOD_RECOMMENDATIONS.find(r => r.deficiency_type === profile.indicators[0]?.deficiency_type)?.food_name || 'Fortified Staples'}.`,
          whatCouldComplement: `Pulses (Masoor Dal) or Double Fortified Salt are highly complementary.`,
          importantLimitation: profile.disclaimer,
        },
        evidence: { source: 'NFHS-5 District Survey Data', populationGroup: 'children_6_59_months', geographyLevel: 'district', surveyYear: '2019-2021', confidence: 'MEDIUM' },
        technicalDetails: { toggleLabel: lang === 'hi' ? 'वैज्ञानिक जानकारी देखें' : lang === 'mr' ? 'तांत्रिक माहिती पहा' : 'View technical details', indicatorValues: profile.indicators.map(i => `${i.deficiency_type}: ${i.prevalence_pct}%`).join(', ') },
        disclaimer: MEDICAL_DISCLAIMER[lang] || MEDICAL_DISCLAIMER.en,
        activeContext: updatedContext,
      };
    }
  }

  // Task D: Global / State Donation Location Recommendation (e.g. "I have 200 kg rice. Where should I donate in Maharashtra?")
  if (updatedContext.activeInventory.length > 0 && updatedContext.locationConstraint !== 'HARD') {
    const matchResult = executeInventoryMatchingTool({
      inventory: updatedContext.activeInventory,
      locationConstraint: 'NONE',
      stateConstraint: updatedContext.stateConstraint,
      activeState: updatedContext.activeState,
    });

    if (matchResult.success && matchResult.topRecommendedRegion) {
      const topMatch = matchResult.topRecommendedRegion;
      const topMatches = matchResult.regionMatches.slice(0, 3);
      const breakdown = matchResult.nutrientAnalysis.itemBreakdown[0] || {};
      const foodNotice = breakdown.assumptionNotice || 'Staple grain donation providing essential energy support.';

      return {
        explanation: lang === 'hi'
          ? `आपके दान के लिए सबसे उपयुक्त स्थान ${topMatch.villageName} (${topMatch.district}) है।`
          : lang === 'mr'
          ? `आपल्या योगदानासाठी सर्वात योग्य ठिकाण ${topMatch.villageName} (${topMatch.district}) आहे.`
          : `The top recommended location for your donation is ${topMatch.villageName} (${topMatch.district}, ${topMatch.state}).`,
        answer: `Top recommended location: ${topMatch.villageName}`,
        citations: [],
        queryGrounded: true,
        sections: {
          recommendedLocations: topMatches.map(m => ({
            location: `${m.villageName}, ${m.district} (${m.state})`,
            why: m.recommendationReason,
            priorityScore: m.priorityScore,
            aidGapPct: m.aidGapPct,
            quadrant: m.quadrant,
          })),
          whyThisLocation: `${topMatch.villageName} has an identified priority score of ${topMatch.priorityScore}/100, aid gap of ${topMatch.aidGapPct}%, and potential child coverage of ~${Math.round(topMatch.potentialCoveragePct)}%.`,
          yourDonation: updatedContext.activeInventory,
          estimatedReach: { beneficiaries: matchResult.nutrientAnalysis.estimatedImpact.maxBeneficiaries30Days || 50, unitLabel: 'children supported (1 month)' },
          whatFoodProvides: foodNotice,
          whatCouldComplement: 'Adding pulses (Masoor Dal) or Double Fortified Salt complements this donation for micronutrient gaps.',
        },
        evidence: { source: 'NFHS-5 Survey & ICMR-NIN IFCT 2017', populationGroup: 'children_6_59_months', geographyLevel: 'district', surveyYear: '2019-2021', confidence: 'MEDIUM' },
        technicalDetails: { toggleLabel: lang === 'hi' ? 'वैज्ञानिक जानकारी देखें' : lang === 'mr' ? 'तांत्रिक माहिती पहा' : 'View technical details', rawFormula: 'RelevanceScore = 0.5 * (NutrientMatch * Severity * AidGapPct * PotentialCoveragePct) + 0.5 * BasePriorityScore' },
        intent: 'DONATION_LOCATION',
        language: lang,
        disclaimer: MEDICAL_DISCLAIMER[lang] || MEDICAL_DISCLAIMER.en,
        activeContext: updatedContext,
      };
    }
  }

  // Task E: Food Suitability & Health-Claim Safety
  if (queryLower.includes('good for') || queryLower.includes('cure') || queryLower.includes('treat') || queryLower.includes('useful for') || queryLower.includes('is jaggery') || queryLower.includes('गुड़') || queryLower.includes('गुळ')) {
    const suitabilityResult = executeFoodSuitabilityTool({ foodName: queryText, deficiencyType: entities.targetNutrient || 'iron', language: lang });
    return {
      explanation: suitabilityResult.explanation,
      answer: suitabilityResult.explanation,
      citations: [],
      queryGrounded: true,
      sections: null,
      evidence: { source: 'ICMR-NIN Indian Food Composition Tables (IFCT 2017)', populationGroup: 'general_population', geographyLevel: 'national', surveyYear: '2017', confidence: 'HIGH' },
      technicalDetails: { toggleLabel: lang === 'hi' ? 'वैज्ञानिक जानकारी देखें' : lang === 'mr' ? 'तांत्रिक माहिती पहा' : 'View technical details', values: 'Sugarcane Jaggery Code A012: 11.4mg Iron / 100g' },
      disclaimer: suitabilityResult.healthClaimNotice,
      activeContext: updatedContext,
    };
  }

  // Task F: General Nutrition RAG Fallback Execution
  const ragResult = executeEvidenceSearchTool({ queryText, language: lang });

  return {
    explanation: ragResult.answer,
    answer: ragResult.answer,
    citations: ragResult.citations,
    queryGrounded: ragResult.queryGrounded,
    sections: null,
    evidence: ragResult.evidence,
    technicalDetails: ragResult.technicalDetails,
    disclaimer: ragResult.disclaimer,
    activeContext: updatedContext,
  };
}
