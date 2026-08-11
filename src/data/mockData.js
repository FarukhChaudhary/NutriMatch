// NutriMatch Mock Data — NFHS-5 style district-level statistics
// Used by both frontend (direct import) and backend seed script

export const VILLAGES = [
  {
    id: 'v1',
    name: 'Washim',
    district: 'Washim',
    state: 'Maharashtra',
    lat: 20.1119,
    lng: 77.1464,
    population: 12400,
    child_population: 2100,
  },
  {
    id: 'v2',
    name: 'Nandurbar',
    district: 'Nandurbar',
    state: 'Maharashtra',
    lat: 21.3666,
    lng: 74.2433,
    population: 9800,
    child_population: 1950,
  },
  {
    id: 'v3',
    name: 'Dholpur',
    district: 'Dholpur',
    state: 'Rajasthan',
    lat: 26.7013,
    lng: 77.8965,
    population: 15600,
    child_population: 3200,
  },
  {
    id: 'v4',
    name: 'Bahraich',
    district: 'Bahraich',
    state: 'Uttar Pradesh',
    lat: 27.5742,
    lng: 81.5946,
    population: 18200,
    child_population: 4100,
  },
  {
    id: 'v5',
    name: 'Sheopur',
    district: 'Sheopur',
    state: 'Madhya Pradesh',
    lat: 25.6667,
    lng: 76.6833,
    population: 8900,
    child_population: 1750,
  },
  {
    id: 'v6',
    name: 'Palghar',
    district: 'Palghar',
    state: 'Maharashtra',
    lat: 19.6967,
    lng: 72.7697,
    population: 11300,
    child_population: 2400,
  },
  {
    id: 'v7',
    name: 'Barmer',
    district: 'Barmer',
    state: 'Rajasthan',
    lat: 25.7521,
    lng: 71.3967,
    population: 14100,
    child_population: 2900,
  },
  {
    id: 'v8',
    name: 'Chandauli',
    district: 'Chandauli',
    state: 'Uttar Pradesh',
    lat: 25.2700,
    lng: 83.2700,
    population: 10500,
    child_population: 2200,
  },
];

export const DEFICIENCY_RECORDS = [
  // Washim — iron-heavy + zinc
  { id: 'd1', village_id: 'v1', deficiency_type: 'iron', severity: 'severe', prevalence_pct: 71.2, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd2', village_id: 'v1', deficiency_type: 'zinc', severity: 'moderate', prevalence_pct: 43.5, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd3', village_id: 'v1', deficiency_type: 'vitamin_a', severity: 'mild', prevalence_pct: 24.1, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd4', village_id: 'v1', deficiency_type: 'folate', severity: 'moderate', prevalence_pct: 38.9, source: 'NFHS-5 (2019-21)', year: 2021 },

  // Nandurbar — vitamin A + iron
  { id: 'd5', village_id: 'v2', deficiency_type: 'vitamin_a', severity: 'severe', prevalence_pct: 68.4, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd6', village_id: 'v2', deficiency_type: 'iron', severity: 'severe', prevalence_pct: 65.1, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd7', village_id: 'v2', deficiency_type: 'iodine', severity: 'moderate', prevalence_pct: 41.2, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd8', village_id: 'v2', deficiency_type: 'zinc', severity: 'moderate', prevalence_pct: 37.8, source: 'NFHS-5 (2019-21)', year: 2021 },

  // Dholpur — folate + iodine
  { id: 'd9', village_id: 'v3', deficiency_type: 'folate', severity: 'severe', prevalence_pct: 74.3, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd10', village_id: 'v3', deficiency_type: 'iodine', severity: 'severe', prevalence_pct: 62.7, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd11', village_id: 'v3', deficiency_type: 'iron', severity: 'moderate', prevalence_pct: 48.9, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd12', village_id: 'v3', deficiency_type: 'vitamin_a', severity: 'mild', prevalence_pct: 19.3, source: 'NFHS-5 (2019-21)', year: 2021 },

  // Bahraich — all five, severe
  { id: 'd13', village_id: 'v4', deficiency_type: 'iron', severity: 'severe', prevalence_pct: 78.6, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd14', village_id: 'v4', deficiency_type: 'vitamin_a', severity: 'severe', prevalence_pct: 71.1, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd15', village_id: 'v4', deficiency_type: 'zinc', severity: 'severe', prevalence_pct: 66.4, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd16', village_id: 'v4', deficiency_type: 'iodine', severity: 'moderate', prevalence_pct: 51.2, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd17', village_id: 'v4', deficiency_type: 'folate', severity: 'severe', prevalence_pct: 69.8, source: 'NFHS-5 (2019-21)', year: 2021 },

  // Sheopur — zinc + vitamin A
  { id: 'd18', village_id: 'v5', deficiency_type: 'zinc', severity: 'severe', prevalence_pct: 70.2, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd19', village_id: 'v5', deficiency_type: 'vitamin_a', severity: 'severe', prevalence_pct: 63.8, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd20', village_id: 'v5', deficiency_type: 'iron', severity: 'moderate', prevalence_pct: 44.7, source: 'NFHS-5 (2019-21)', year: 2021 },

  // Palghar — iron + folate
  { id: 'd21', village_id: 'v6', deficiency_type: 'iron', severity: 'severe', prevalence_pct: 69.5, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd22', village_id: 'v6', deficiency_type: 'folate', severity: 'severe', prevalence_pct: 61.2, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd23', village_id: 'v6', deficiency_type: 'zinc', severity: 'mild', prevalence_pct: 22.4, source: 'NFHS-5 (2019-21)', year: 2021 },

  // Barmer — iodine + iron
  { id: 'd24', village_id: 'v7', deficiency_type: 'iodine', severity: 'severe', prevalence_pct: 73.1, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd25', village_id: 'v7', deficiency_type: 'iron', severity: 'severe', prevalence_pct: 67.9, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd26', village_id: 'v7', deficiency_type: 'folate', severity: 'moderate', prevalence_pct: 39.4, source: 'NFHS-5 (2019-21)', year: 2021 },

  // Chandauli — moderate across the board
  { id: 'd27', village_id: 'v8', deficiency_type: 'iron', severity: 'moderate', prevalence_pct: 53.2, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd28', village_id: 'v8', deficiency_type: 'vitamin_a', severity: 'moderate', prevalence_pct: 46.8, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd29', village_id: 'v8', deficiency_type: 'zinc', severity: 'mild', prevalence_pct: 28.6, source: 'NFHS-5 (2019-21)', year: 2021 },
  { id: 'd30', village_id: 'v8', deficiency_type: 'iodine', severity: 'mild', prevalence_pct: 21.1, source: 'NFHS-5 (2019-21)', year: 2021 },
];

// Weighted scoring: score = (nutrient_match×0.4) + (local_availability×0.25) + (cost×0.25) + (shelf_life×0.10)
export const FOOD_RECOMMENDATIONS = [
  // Iron
  { id: 'r1', deficiency_type: 'iron', food_name: 'Fortified Rice', nutrient_match_score: 9.2, local_availability_score: 8.5, cost_score: 9.0, shelf_life_score: 8.0, citation: 'WHO. Micronutrient fortification of foods (2023). https://www.who.int/health-topics/micronutrients', description: 'Iron-fortified rice distributed through PDS reaches households directly and is culturally accepted across all regions.' },
  { id: 'r2', deficiency_type: 'iron', food_name: 'Jaggery (Gur)', nutrient_match_score: 7.5, local_availability_score: 9.5, cost_score: 9.2, shelf_life_score: 8.5, citation: 'ICMR. Nutritive Value of Indian Foods (2017). NIN, Hyderabad.', description: 'Traditional jaggery contains non-heme iron and is widely available, affordable, and culturally embedded across rural India.' },
  { id: 'r3', deficiency_type: 'iron', food_name: 'Dried Lentils (Masoor Dal)', nutrient_match_score: 8.0, local_availability_score: 8.8, cost_score: 8.7, shelf_life_score: 9.2, citation: 'ICMR. Nutritive Value of Indian Foods (2017). NIN, Hyderabad.', description: 'Lentils are a high-iron legume with long shelf life, storable without refrigeration, and central to existing food habits.' },
  { id: 'r4', deficiency_type: 'iron', food_name: 'Drumstick Leaves (Moringa)', nutrient_match_score: 8.8, local_availability_score: 7.0, cost_score: 9.5, shelf_life_score: 4.0, citation: 'Fuglie L.J. The Miracle Tree: Moringa oleifera. CTA (2001).', description: 'Moringa leaves are exceptionally rich in iron and can be grown locally; limited shelf life is a distribution challenge.' },

  // Vitamin A
  { id: 'r5', deficiency_type: 'vitamin_a', food_name: 'Vitamin A Supplementation Capsules', nutrient_match_score: 10.0, local_availability_score: 7.0, cost_score: 8.5, shelf_life_score: 9.5, citation: 'WHO. Vitamin A supplementation in infants and children (2011). https://www.who.int/', description: 'Biannual Vitamin A supplementation through ASHA workers is the most direct, clinically validated intervention for severe deficiency.' },
  { id: 'r6', deficiency_type: 'vitamin_a', food_name: 'Sweet Potato (Orange Flesh)', nutrient_match_score: 9.0, local_availability_score: 7.5, cost_score: 8.8, shelf_life_score: 6.0, citation: 'Low J.W. et al. HarvestPlus (2017). Orange-fleshed sweet potato in food-based interventions.', description: 'Orange-fleshed sweet potato is a biofortified crop with high beta-carotene, suitable for home gardening programs.' },
  { id: 'r7', deficiency_type: 'vitamin_a', food_name: 'Carrot & Leafy Vegetable Mix', nutrient_match_score: 8.5, local_availability_score: 7.8, cost_score: 7.5, shelf_life_score: 3.5, citation: 'UNICEF. Improving child nutrition (2013). New York: UNICEF.', description: 'Seasonal vegetable mixes high in carotenoids; best distributed fresh through Anganwadi centres for maximum potency.' },
  { id: 'r8', deficiency_type: 'vitamin_a', food_name: 'Fortified Edible Oil', nutrient_match_score: 8.2, local_availability_score: 8.3, cost_score: 7.8, shelf_life_score: 8.8, citation: 'FSSAI. Fortification of Foods. https://fssai.gov.in/fortification', description: 'Vitamin A-fortified edible oil integrates into cooking without behavior change and has long shelf life.' },

  // Zinc
  { id: 'r9', deficiency_type: 'zinc', food_name: 'Zinc-ORS Supplementation', nutrient_match_score: 9.8, local_availability_score: 7.5, cost_score: 8.2, shelf_life_score: 9.8, citation: 'WHO. Zinc supplementation in the management of diarrhoea (2023). https://www.who.int/', description: 'Zinc-ORS combination tablets are recommended for children under 5 during diarrhoea episodes and as a preventive supplement.' },
  { id: 'r10', deficiency_type: 'zinc', food_name: 'Sesame Seeds (Til)', nutrient_match_score: 8.0, local_availability_score: 8.9, cost_score: 9.1, shelf_life_score: 9.0, citation: 'ICMR. Nutritive Value of Indian Foods (2017). NIN, Hyderabad.', description: 'Sesame seeds are a high-zinc food with excellent shelf life, available year-round, and used in traditional snacks (chikki).' },
  { id: 'r11', deficiency_type: 'zinc', food_name: 'Pumpkin Seeds', nutrient_match_score: 8.5, local_availability_score: 7.2, cost_score: 7.8, shelf_life_score: 9.0, citation: 'Greger JL. Zinc nutrition. In: Zinc in human biology. ILSI (1989).', description: 'Pumpkin seeds are zinc-dense with a neutral flavour and can be added to existing snack distributions.' },

  // Iodine
  { id: 'r12', deficiency_type: 'iodine', food_name: 'Iodised Salt (Double Fortified)', nutrient_match_score: 10.0, local_availability_score: 9.2, cost_score: 9.5, shelf_life_score: 9.8, citation: 'UNICEF/WHO/ICCIDD. Assessment of Iodine Deficiency Disorders (2007).', description: 'Double-fortified iodised salt (iron + iodine) is the most cost-effective, scalable intervention for iodine deficiency.' },
  { id: 'r13', deficiency_type: 'iodine', food_name: 'Iodine Supplementation Drops', nutrient_match_score: 9.5, local_availability_score: 6.5, cost_score: 7.8, shelf_life_score: 8.5, citation: 'WHO. Iodine deficiency in Europe: a continuing public health problem (2007).', description: 'Iodine drops administered via health workers for areas where iodised salt uptake remains low.' },

  // Folate
  { id: 'r14', deficiency_type: 'folate', food_name: 'Folic Acid Tablets (IFA Programme)', nutrient_match_score: 10.0, local_availability_score: 8.0, cost_score: 9.2, shelf_life_score: 9.5, citation: 'MoHFW. Weekly Iron and Folic Acid Supplementation Programme (WIFS). Govt. of India.', description: 'Weekly IFA tablets distributed through government WIFS programme to adolescent girls and women — high coverage, low cost.' },
  { id: 'r15', deficiency_type: 'folate', food_name: 'Fortified Wheat Flour (Atta)', nutrient_match_score: 8.8, local_availability_score: 8.5, cost_score: 8.8, shelf_life_score: 8.0, citation: 'FSSAI. Fortification of Foods. https://fssai.gov.in/fortification', description: 'Folate-fortified atta distributed through PDS integrates with existing food distribution with no additional behavior change.' },
  { id: 'r16', deficiency_type: 'folate', food_name: 'Green Leafy Vegetables Bundle', nutrient_match_score: 8.5, local_availability_score: 7.5, cost_score: 8.5, shelf_life_score: 2.5, citation: 'ICMR. Nutritive Value of Indian Foods (2017). NIN, Hyderabad.', description: 'Spinach, methi, and amaranth are high in folate; best distributed fresh near source through Anganwadi or kitchen gardens.' },
];

// Compute weighted score for each recommendation
export function computeScore(rec) {
  return (
    rec.nutrient_match_score * 0.40 +
    rec.local_availability_score * 0.25 +
    rec.cost_score * 0.25 +
    rec.shelf_life_score * 0.10
  );
}

// Get top 3 recommendations for a village given its deficiency records
export function getTopRecommendations(villageId) {
  const villageDefs = DEFICIENCY_RECORDS.filter(d => d.village_id === villageId);
  const deficiencyTypes = villageDefs.map(d => d.deficiency_type);

  // Score and rank all applicable recommendations
  const scored = FOOD_RECOMMENDATIONS
    .filter(r => deficiencyTypes.includes(r.deficiency_type))
    .map(r => {
      const defRecord = villageDefs.find(d => d.deficiency_type === r.deficiency_type);
      const severityWeight = defRecord?.severity === 'severe' ? 1.2 : defRecord?.severity === 'moderate' ? 1.0 : 0.8;
      return {
        ...r,
        computedScore: computeScore(r) * severityWeight,
        severity: defRecord?.severity,
        prevalence: defRecord?.prevalence_pct,
      };
    })
    .sort((a, b) => b.computedScore - a.computedScore)
    .slice(0, 3);

  return scored;
}

export const NGO_ACTIVITIES = [
  { id: 'a1', ngo_id: 'ngo1', village_id: 'v1', item_distributed: 'Fortified Rice (50kg bags)', deficiency_addressed: 'iron', start_date: '2024-01-10', end_date: null, status: 'active', notes: 'Monthly distribution via PDS centres' },
  { id: 'a2', ngo_id: 'ngo1', village_id: 'v2', item_distributed: 'Vitamin A Capsules', deficiency_addressed: 'vitamin_a', start_date: '2024-02-01', end_date: null, status: 'active', notes: 'Biannual supplementation drive' },
  { id: 'a3', ngo_id: 'ngo2', village_id: 'v1', item_distributed: 'Iron-Folic Acid Tablets', deficiency_addressed: 'iron', start_date: '2024-01-15', end_date: null, status: 'active', notes: 'Targeting adolescent girls in the village' },
  { id: 'a4', ngo_id: 'ngo2', village_id: 'v4', item_distributed: 'Iodised Salt (Double Fortified)', deficiency_addressed: 'iodine', start_date: '2024-03-01', end_date: null, status: 'active', notes: 'Community kitchen distribution' },
  { id: 'a5', ngo_id: 'ngo1', village_id: 'v3', item_distributed: 'Folic Acid Tablets', deficiency_addressed: 'folate', start_date: '2024-02-20', end_date: '2024-06-20', status: 'completed', notes: 'Completed 4-month cycle' },
];

export const USERS = [
  { id: 'ngo1', name: 'Akanksha Foundation', email: 'akanksha@ngo.org', role: 'ngo', organization: 'Akanksha Foundation' },
  { id: 'ngo2', name: 'Smile Foundation', email: 'smile@ngo.org', role: 'ngo', organization: 'Smile Foundation' },
  { id: 'pm1', name: 'Priya Mehta', email: 'priya@govt.in', role: 'program_manager', organization: 'MoHFW' },
  { id: 'donor1', name: 'Rahul Sharma', email: 'rahul@email.com', role: 'donor', organization: null },
];

export const DONOR_PLEDGES = [
  { id: 'p1', donor_id: 'donor1', village_id: 'v4', recommendation_id: 'r1', amount_inr: 5000, item_description: null, date: '2024-03-15', status: 'pending' },
  { id: 'p2', donor_id: 'donor1', village_id: 'v2', recommendation_id: 'r5', amount_inr: null, item_description: 'Vitamin A Capsules (500 units)', date: '2024-03-20', status: 'fulfilled' },
];
