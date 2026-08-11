// backend/scripts/test_inventory.js
// Verification suite for Step 4 — Food Inventory Matching & IFCT 2017 Verification

import { VILLAGES, DEFICIENCY_RECORDS, NGO_ACTIVITIES } from '../../src/data/mockData.js';
import { calculateNutrientContribution, matchInventoryToRegions } from '../../src/utils/inventoryMatcher.js';

console.log('====================================================');
console.log('   STEP 4 VERIFICATION: FOOD INVENTORY MATCHING    ');
console.log('====================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failCount++;
  }
}

// Test 1: Verified IFCT Nutrient Contribution for 100kg Masoor Dal & 50kg Fortified Rice
console.log('[Test 1] Calculating verified nutrient contribution for inventory batch...');
const mockInventory = [
  { id: 'inv1', food_code: 'B004', item_name: 'Masoor Dal', quantity: 100, unit: 'kg', estimated_value_inr: 9000 },
  { id: 'inv2', food_code: 'A001', item_name: 'Fortified Rice', quantity: 50, unit: 'kg', estimated_value_inr: 2500 },
];

const contribution = calculateNutrientContribution(mockInventory);

assert(contribution.itemBreakdown[0].ifctMatched === true, 'Masoor Dal matched verified ICMR-NIN IFCT 2017 record (Code B004)');
assert(contribution.itemBreakdown[0].ironMgProvided === 7600, `Masoor Dal 100kg provides 7,600mg Iron (7.6mg/100g x 1000 100g units): ${contribution.itemBreakdown[0].ironMgProvided}mg`);
assert(contribution.itemBreakdown[0].folateMcgProvided === 145000, `Masoor Dal 100kg provides 145,000mcg Folate: ${contribution.itemBreakdown[0].folateMcgProvided}mcg`);
assert(contribution.totals.ironMg === 17600, `Total batch iron yield calculated: ${contribution.totals.ironMg}mg`);

// Test 2: Unverified Food Data Handling
console.log('\n[Test 2] Verifying handling of unverified food item without IFCT code...');
const unverifiedInventory = [
  { id: 'inv3', food_code: 'UNKNOWN_99', item_name: 'Custom Exotic Snack', quantity: 10, unit: 'kg', estimated_value_inr: 500 },
];

const unverifiedContribution = calculateNutrientContribution(unverifiedInventory);

assert(unverifiedContribution.itemBreakdown[0].ifctMatched === false, 'Unrecognized food flagged as unverified');
assert(
  unverifiedContribution.itemBreakdown[0].nutrientNotice === 'IFCT Data unavailable — verified composition record not found.',
  'Displays explicit "IFCT Data unavailable" notice without fabricating values'
);
assert(unverifiedContribution.itemBreakdown[0].ironMgProvided === 0, 'Unverified food iron yield set to 0');

// Test 3: Region Matching Based on Uncovered Aid Gaps
console.log('\n[Test 3] Matching inventory batch against high-need regions...');
const matchResult = matchInventoryToRegions(mockInventory, VILLAGES, DEFICIENCY_RECORDS, NGO_ACTIVITIES, []);

assert(matchResult.regionMatches.length === VILLAGES.length, 'All villages scored for inventory relevance');
assert(matchResult.topRecommendedRegion !== null, `Top matched region identified: ${matchResult.topRecommendedRegion?.villageName} (${matchResult.topRecommendedRegion?.district})`);
assert(matchResult.topRecommendedRegion?.relevanceScore > 0, `Top relevance score: ${matchResult.topRecommendedRegion?.relevanceScore}`);

console.log('\n[Test 4] Sample Inventory Calculation Output:');
console.log(JSON.stringify({
  totals: contribution.totals,
  estimatedImpact: contribution.estimatedImpact,
  topMatch: matchResult.topRecommendedRegion,
}, null, 2));

console.log('\n====================================================');
console.log(`   TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
