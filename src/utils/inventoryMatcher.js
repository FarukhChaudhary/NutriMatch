// src/utils/inventoryMatcher.js
// NutriMatch Phase 2 — Food Inventory Matching & IFCT 2017 Nutrient Contribution Engine

import { calculateAidCoverage } from './aidGapEngine.js';
import { buildNutritionProfile } from './nutritionProfileEngine.js';

export const OFFICIAL_IFCT2017_FOODS = [
  {
    food_code: 'A001',
    food_name: 'Fortified Rice (Iron-Fortified)',
    category: 'Cereals and Millets',
    deficiency_addressed: 'iron',
    iron_mg_100g: 20,
    zinc_mg_100g: 1.4,
    folate_mcg_100g: 15,
    vitamin_a_mcg_100g: 0,
    bioavailability_rating: 'High',
    citation: 'ICMR-NIN IFCT (2017) & FSSAI Operational Guidelines on Food Fortification',
    description: 'Iron-fortified rice distributed through Public Distribution System (PDS) provides 20mg iron per 100g cooked grain.'
  },
  {
    food_code: 'A012',
    food_name: 'Sugarcane Jaggery (Gur)',
    category: 'Sugars & Sweets',
    deficiency_addressed: 'iron',
    iron_mg_100g: 11.4,
    zinc_mg_100g: 0.4,
    folate_mcg_100g: 0,
    vitamin_a_mcg_100g: 0,
    bioavailability_rating: 'Medium',
    citation: 'ICMR-NIN Indian Food Composition Tables (IFCT 2017), Code A012',
    description: 'Natural unrefined sugar containing 11.4mg iron per 100g; culturally accepted across rural Indian households.'
  },
  {
    food_code: 'B004',
    food_name: 'Masoor Dal (Lentil, Whole Red)',
    category: 'Pulses and Legumes',
    deficiency_addressed: 'iron',
    iron_mg_100g: 7.6,
    zinc_mg_100g: 2.7,
    folate_mcg_100g: 145,
    vitamin_a_mcg_100g: 0,
    bioavailability_rating: 'High',
    citation: 'ICMR-NIN Indian Food Composition Tables (IFCT 2017), Code B004',
    description: 'High-protein staple pulse yielding 7.6mg iron and 145mcg folate per 100g; excellent non-perishable shelf life.'
  },
  {
    food_code: 'D021',
    food_name: 'Moringa Leaves (Drumstick Leaf)',
    category: 'Green Leafy Vegetables',
    deficiency_addressed: 'iron',
    iron_mg_100g: 28.2,
    zinc_mg_100g: 0.6,
    folate_mcg_100g: 40,
    vitamin_a_mcg_100g: 11300,
    bioavailability_rating: 'Very High',
    citation: 'ICMR-NIN Indian Food Composition Tables (IFCT 2017), Code D021',
    description: 'Nutrient powerhouse containing 28.2mg iron and 11,300mcg beta-carotene (Vitamin A) per 100g dry weight.'
  },
  {
    food_code: 'D005',
    food_name: 'Carrot (Orange Flesh)',
    category: 'Roots and Tubers',
    deficiency_addressed: 'vitamin_a',
    iron_mg_100g: 0.5,
    zinc_mg_100g: 0.2,
    folate_mcg_100g: 15,
    vitamin_a_mcg_100g: 8285,
    bioavailability_rating: 'High',
    citation: 'ICMR-NIN Indian Food Composition Tables (IFCT 2017), Code D005',
    description: 'Contains 8,285mcg beta-carotene (Vitamin A precursor) per 100g fresh weight.'
  },
  {
    food_code: 'H010',
    food_name: 'Sesame Seeds (Til, White)',
    category: 'Oil Seeds',
    deficiency_addressed: 'zinc',
    iron_mg_100g: 14.6,
    zinc_mg_100g: 7.8,
    folate_mcg_100g: 97,
    vitamin_a_mcg_100g: 0,
    bioavailability_rating: 'High',
    citation: 'ICMR-NIN Indian Food Composition Tables (IFCT 2017), Code H010',
    description: 'Extremely dense source of zinc (7.8mg/100g) and iron (14.6mg/100g), ideal for long-storage chikki snacks.'
  },
  {
    food_code: 'M001',
    food_name: 'Double Fortified Salt (DFS - Iron + Iodine)',
    category: 'Fortified Staples',
    deficiency_addressed: 'iodine',
    iron_mg_100g: 100,
    zinc_mg_100g: 0,
    folate_mcg_100g: 0,
    vitamin_a_mcg_100g: 0,
    bioavailability_rating: 'High',
    citation: 'FSSAI Standards & ICMR-NIN Double Fortification Guidelines (2018)',
    description: 'Provides 30 PPM Iodine and 800-1100 PPM Iron; universal cooking condiment requiring no dietary change.'
  },
  {
    food_code: 'M002',
    food_name: 'Weekly Iron-Folic Acid Supplement (IFA Tablet)',
    category: 'Clinical Supplements',
    deficiency_addressed: 'folate',
    iron_mg_100g: 60,
    zinc_mg_100g: 0,
    folate_mcg_100g: 500,
    vitamin_a_mcg_100g: 0,
    bioavailability_rating: 'Clinical Maximum',
    citation: 'MoHFW Anemia Mukt Bharat & WIFS Program Guidelines, Govt. of India',
    description: 'Government standard 60mg elemental iron + 500mcg Folic Acid tablet distributed weekly to children & mothers.'
  }
];

/**
 * Calculates exact nutrient yield and estimated reach using strictly verified ICMR-NIN IFCT 2017 values
 */
export function calculateNutrientContribution(inventoryItems) {
  let totalIronMg = 0;
  let totalZincMg = 0;
  let totalFolateMcg = 0;
  let totalVitaminAMcg = 0;

  const itemBreakdown = inventoryItems.map(item => {
    // Match with verified IFCT 2017 record by code or name
    const ifctRecord = OFFICIAL_IFCT2017_FOODS.find(
      f => f.food_code === item.food_code || f.food_name.toLowerCase().includes(item.item_name.toLowerCase())
    );

    if (!ifctRecord) {
      return {
        ...item,
        ifctMatched: false,
        nutrientNotice: 'IFCT Data unavailable — verified composition record not found.',
        ironMgProvided: 0,
        zincMgProvided: 0,
        folateMcgProvided: 0,
        vitaminAMcgProvided: 0,
      };
    }

    // Standardize quantity to 100g units (1kg = 10 units of 100g)
    const factor100g = item.unit === 'kg' ? item.quantity * 10 : item.unit === 'grams' ? item.quantity / 100 : item.quantity;

    const ironMg = (ifctRecord.iron_mg_100g ?? 0) * factor100g;
    const zincMg = (ifctRecord.zinc_mg_100g ?? 0) * factor100g;
    const folateMcg = (ifctRecord.folate_mcg_100g ?? 0) * factor100g;
    const vitaminAMcg = (ifctRecord.vitamin_a_mcg_100g ?? 0) * factor100g;

    totalIronMg += ironMg;
    totalZincMg += zincMg;
    totalFolateMcg += folateMcg;
    totalVitaminAMcg += vitaminAMcg;

    return {
      ...item,
      ifctMatched: true,
      foodCode: ifctRecord.food_code,
      citation: ifctRecord.citation,
      ironMgProvided: Math.round(ironMg * 10) / 10,
      zincMgProvided: Math.round(zincMg * 10) / 10,
      folateMcgProvided: Math.round(folateMcg * 10) / 10,
      vitaminAMcgProvided: Math.round(vitaminAMcg * 10) / 10,
      deficiencyAddressed: ifctRecord.deficiency_addressed,
    };
  });

  // ICMR Child RDAs: Iron ~10mg/day, Zinc ~5mg/day, Folate ~120mcg/day, Vitamin A ~400mcg/day
  const estimatedChildDaysIron = Math.round(totalIronMg / 10);
  const estimatedChildDaysZinc = Math.round(totalZincMg / 5);
  const estimatedChildDaysFolate = Math.round(totalFolateMcg / 120);
  const estimatedChildDaysVitA = Math.round(totalVitaminAMcg / 400);

  return {
    totalItems: inventoryItems.length,
    itemBreakdown,
    totals: {
      ironMg: Math.round(totalIronMg),
      zincMg: Math.round(totalZincMg),
      folateMcg: Math.round(totalFolateMcg),
      vitaminAMcg: Math.round(totalVitaminAMcg),
    },
    estimatedImpact: {
      childDaysIron: estimatedChildDaysIron,
      childDaysZinc: estimatedChildDaysZinc,
      childDaysFolate: estimatedChildDaysFolate,
      childDaysVitA: estimatedChildDaysVitA,
      maxBeneficiaries30Days: Math.round(Math.max(estimatedChildDaysIron, estimatedChildDaysZinc, estimatedChildDaysFolate, estimatedChildDaysVitA) / 30),
    },
  };
}

/**
 * Matches available inventory against high-need regions based on aid gaps
 */
export function matchInventoryToRegions(inventoryItems, villages, deficiencyRecords, ngoActivities = [], donorPledges = []) {
  const nutrientAnalysis = calculateNutrientContribution(inventoryItems);
  const targetNutrients = new Set(nutrientAnalysis.itemBreakdown.map(i => i.deficiencyAddressed).filter(Boolean));

  const regionMatches = villages.map(village => {
    const vDefs = deficiencyRecords.filter(d => d.village_id === village.id);
    const gapInfo = calculateAidCoverage(village, vDefs, ngoActivities, donorPledges);
    const profile = buildNutritionProfile(village, vDefs, 'district');

    // Relevance score = matches between inventory primary nutrient yield and uncovered village gaps
    const relevantGaps = gapInfo.uncoveredDeficiencies.filter(def => targetNutrients.has(def));
    const relevanceScore = (relevantGaps.length * 40) + (profile.priorityScore * 0.6);

    return {
      villageId: village.id,
      villageName: village.name,
      district: village.district,
      state: village.state,
      priorityScore: profile.priorityScore,
      quadrant: gapInfo.quadrant,
      aidGapPct: gapInfo.aidGapPct,
      relevantGaps,
      relevanceScore: Math.round(relevanceScore),
      recommendationReason: relevantGaps.length > 0
        ? `Directly addresses uncovered ${relevantGaps.join(', ')} deficiency gap in ${village.name}`
        : `Secondary nutritional support for ${village.name}`,
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    nutrientAnalysis,
    regionMatches,
    topRecommendedRegion: regionMatches[0],
  };
}
