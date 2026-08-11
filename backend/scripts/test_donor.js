// backend/scripts/test_donor.js
// Verification suite for Step 7 — Donor Intelligence & Transparency

import { calculateDonorImpact, matchPledgeToPriorityNeed } from '../../src/utils/donorEngine.js';

console.log('====================================================');
console.log('   STEP 7 VERIFICATION: DONOR INTELLIGENCE          ');
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

// Test 1: Calculating Donor Impact for ₹5,000 Pledge
console.log('[Test 1] Calculating donor impact for ₹5,000 pledge...');
const impact1 = calculateDonorImpact(5000, 'iron');

assert(impact1.amountINR === 5000, 'Pledge amount recorded: ₹5,000');
assert(impact1.estimatedChildDays === 500, `₹5,000 provides ~500 child-days of iron fortification (${impact1.estimatedChildDays})`);
assert(impact1.totalChildrenReached === 17, `₹5,000 reaches ~17 children for 1 full month (${impact1.totalChildrenReached})`);
assert(impact1.populationGroup === 'children_6_59_months', 'Target population group set to children_6_59_months');
assert(impact1.cautiousReachStatement.includes('estimated intervention reach'), 'Cautious reach statement present');

// Test 2: Matching Pledge to High-Need Critical Quadrant Village
console.log('\n[Test 2] Matching pledge to high-need critical quadrant village...');
const matchResult = matchPledgeToPriorityNeed(5000, 'iron');

assert(matchResult.matchedVillage.name !== null, `Matched to high-priority village: ${matchResult.matchedVillage.name} (${matchResult.matchedVillage.district})`);
assert(matchResult.matchedVillage.quadrant === 'CRITICAL', `Target village is in CRITICAL quadrant: ${matchResult.matchedVillage.quadrant}`);
assert(matchResult.evidenceCitation.sourceAuthority.includes('MoHFW'), 'Evidence citation attributes MoHFW / IIPS');
assert(matchResult.evidenceCitation.disclaimer !== null, 'Mandatory geographic disclaimer attached to pledge match');

console.log('\n[Test 3] Sample Donor Match Output:');
console.log(JSON.stringify(matchResult, null, 2));

console.log('\n====================================================');
console.log(`   TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
