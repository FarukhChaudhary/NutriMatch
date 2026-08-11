// backend/scripts/test_nutrition_profile.js
// Verification suite for Step 2 — Nutrition Profile Engine

import { VILLAGES, DEFICIENCY_RECORDS } from '../../src/data/mockData.js';
import { buildNutritionProfile, calculateNutritionPriorityScore, calculateEvidenceCoverage } from '../../src/utils/nutritionProfileEngine.js';

console.log('====================================================');
console.log('   STEP 2 VERIFICATION: NUTRITION PROFILE ENGINE   ');
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

// Test 1: Nutrition Profile Generation for Washim (v1)
console.log('[Test 1] Building Nutrition Profile for Washim (v1)...');
const washimVillage = VILLAGES.find(v => v.id === 'v1');
const washimDefs = DEFICIENCY_RECORDS.filter(d => d.village_id === 'v1');

const washimProfile = buildNutritionProfile(washimVillage, washimDefs, 'district');

assert(washimProfile.priorityScore > 0, `Priority score generated: ${washimProfile.priorityScore}/100`);
assert(['HIGH', 'MODERATE', 'LOW'].includes(washimProfile.priorityCategory), `Priority category assigned: ${washimProfile.priorityCategory}`);
assert(washimProfile.evidenceCoverage.coveragePct === 80, `Evidence coverage calculated: ${washimProfile.evidenceCoverage.coveragePct}% (4 of 5 indicators)`);
assert(washimProfile.evidenceCoverage.unavailableIndicators.includes('iodine'), 'Unmeasured indicator "iodine" correctly listed in unavailableIndicators');

// Test 2: Evidence Coverage for Bahraich (v4 - all 5 indicators)
console.log('\n[Test 2] Verifying 100% Evidence Coverage for Bahraich (v4)...');
const bahraichVillage = VILLAGES.find(v => v.id === 'v4');
const bahraichDefs = DEFICIENCY_RECORDS.filter(d => d.village_id === 'v4');
const bahraichProfile = buildNutritionProfile(bahraichVillage, bahraichDefs, 'district');

assert(bahraichProfile.evidenceCoverage.coveragePct === 100, `Bahraich evidence coverage: ${bahraichProfile.evidenceCoverage.coveragePct}%`);
assert(bahraichProfile.priorityCategory === 'HIGH', `Bahraich high severe burden mapped to HIGH priority: ${bahraichProfile.priorityCategory}`);

// Test 3: Geographic Disclaimer Preservation
console.log('\n[Test 3] Verifying Geographic Disclaimer in Profile...');
assert(
  washimProfile.disclaimer === 'Village-level direct measurement unavailable. This insight uses the latest available district-level evidence.',
  'Geographic disclaimer present on profile'
);

// Test 4: Structured Profile Output Verification
console.log('\n[Test 4] Sample Generated Nutrition Profile Object:');
console.log(JSON.stringify(washimProfile, null, 2));

console.log('\n====================================================');
console.log(`   TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
