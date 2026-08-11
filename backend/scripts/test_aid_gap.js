// backend/scripts/test_aid_gap.js
// Verification suite for Step 3 — Aid Gap Intelligence & NGO Overlap Preservation

import { VILLAGES, DEFICIENCY_RECORDS, NGO_ACTIVITIES, DONOR_PLEDGES } from '../../src/data/mockData.js';
import { calculateAidCoverage, buildAidGapMatrix, detectNGOOverlaps } from '../../src/utils/aidGapEngine.js';

console.log('====================================================');
console.log('   STEP 3 VERIFICATION: AID GAP INTELLIGENCE       ');
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

// Test 1: Preserved NGO Overlap Detection
console.log('[Test 1] Verifying Phase 1 NGO Overlap Detection preservation...');
const overlaps = detectNGOOverlaps(NGO_ACTIVITIES);
assert(overlaps.length > 0, `Detected ${overlaps.length} NGO overlap group(s) in active interventions`);
assert(
  overlaps[0][0].village_id === 'v1' && overlaps[0][0].deficiency_addressed === 'iron',
  'Correctly identified overlapping iron intervention in Washim (v1)'
);

// Test 2: Aid Gap & Coverage Calculation for Washim (v1)
console.log('\n[Test 2] Calculating Aid Gap & Coverage for Washim (v1)...');
const washimVillage = VILLAGES.find(v => v.id === 'v1');
const washimDefs = DEFICIENCY_RECORDS.filter(d => d.village_id === 'v1');
const washimGapAnalysis = calculateAidCoverage(washimVillage, washimDefs, NGO_ACTIVITIES, DONOR_PLEDGES);

assert(washimGapAnalysis.aidCoveragePct === 25, `Washim Aid Coverage: ${washimGapAnalysis.aidCoveragePct}% (1 of 4 deficiencies covered)`);
assert(washimGapAnalysis.aidGapPct === 75, `Washim Aid Gap: ${washimGapAnalysis.aidGapPct}%`);
assert(washimGapAnalysis.coveredDeficiencies.includes('iron'), 'Iron is covered by active NGO intervention');
assert(washimGapAnalysis.uncoveredDeficiencies.includes('zinc'), 'Zinc is correctly flagged as an uncovered gap');

// Test 3: Matrix 4-Quadrant Building
console.log('\n[Test 3] Building 4-Quadrant Aid Gap Matrix...');
const matrix = buildAidGapMatrix(VILLAGES, DEFICIENCY_RECORDS, NGO_ACTIVITIES, DONOR_PLEDGES);

assert(matrix.CRITICAL.length >= 0, `Critical Quadrant (High Need + Low Aid): ${matrix.CRITICAL.length} village(s)`);
assert(matrix.MONITOR.length >= 0, `Monitor Quadrant (High Need + High Aid): ${matrix.MONITOR.length} village(s)`);
assert(matrix.OPPORTUNITY.length >= 0, `Opportunity Quadrant (Low Need + Low Aid): ${matrix.OPPORTUNITY.length} village(s)`);

console.log('\n[Test 4] Sample Aid Gap Matrix Result:');
console.log({
  CRITICAL: matrix.CRITICAL.map(v => v.villageName),
  MONITOR: matrix.MONITOR.map(v => v.villageName),
  OPPORTUNITY: matrix.OPPORTUNITY.map(v => v.villageName),
  POSSIBLE_OVERALLOCATION: matrix.POSSIBLE_OVERALLOCATION.map(v => v.villageName),
});

console.log('\n====================================================');
console.log(`   TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
