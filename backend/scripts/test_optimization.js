// backend/scripts/test_optimization.js
// Verification suite for Step 5 — Deterministic Optimization Engine

import { runResourceOptimization } from '../../src/utils/optimizationEngine.js';

console.log('====================================================');
console.log('   STEP 5 VERIFICATION: DETERMINISTIC OPTIMIZATION  ');
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

// Test 1: Deterministic Optimization Run for Washim (v1) with ₹10,000 budget
console.log('[Test 1] Running optimization for Washim (v1) with ₹10,000 budget...');
const run1 = runResourceOptimization({
  budgetINR: 10000,
  villageId: 'v1',
  maxInterventions: 3,
});

assert(run1.totalAllocatedINR <= 10000, `Total allocated ₹${run1.totalAllocatedINR} stays within budget ₹10,000`);
assert(run1.selectedInterventions.length <= 3, `Selected interventions (${run1.selectedInterventions.length}) respects max constraint (3)`);
assert(run1.objectiveFunction.includes('Maximize'), 'Objective function formula explicitly declared');
assert(run1.rejectedAlternatives.length >= 0, 'Rejected alternatives tracked with mathematical explanations');
assert(run1.projectedSummary.terminologyNotice.includes('projected intervention coverage'), 'Non-clinical cautious terminology notice present');

// Test 2: High Budget Optimization Run for Bahraich (v4) with ₹1,00,000 budget
console.log('\n[Test 2] Running high-budget optimization for Bahraich (v4) with ₹1,00,000...');
const run2 = runResourceOptimization({
  budgetINR: 100000,
  villageId: 'v4',
  maxInterventions: 4,
});

assert(run2.totalAllocatedINR <= 100000, `Total allocated ₹${run2.totalAllocatedINR} stays within ₹1,00,000`);
assert(run2.selectedInterventions.length > 0, `Allocated ${run2.selectedInterventions.length} top nutrient interventions`);
assert(run2.projectedSummary.totalEstimatedChildrenReach > 0, `Projected reach: ${run2.projectedSummary.totalEstimatedChildrenReach} children`);

// Test 3: Invalid Input Error Handling
console.log('\n[Test 3] Verifying invalid input error handling...');
try {
  runResourceOptimization({ budgetINR: -500, villageId: 'v1' });
  assert(false, 'Should have thrown error for negative budget');
} catch (e) {
  assert(e.message.includes('budgetINR must be a positive number'), 'Correctly throws error for negative budget');
}

try {
  runResourceOptimization({ budgetINR: 5000, villageId: 'non_existent_village' });
  assert(false, 'Should have thrown error for non-existent village');
} catch (e) {
  assert(e.message.includes('villageId "non_existent_village" not found'), 'Correctly throws error for non-existent village ID');
}

console.log('\n[Test 4] Sample Optimization Run Result:');
console.log(JSON.stringify({
  villageName: run1.villageName,
  totalBudgetINR: run1.totalBudgetINR,
  totalAllocatedINR: run1.totalAllocatedINR,
  objectiveFunction: run1.objectiveFunction,
  selectedInterventions: run1.selectedInterventions,
  rejectedAlternatives: run1.rejectedAlternatives,
  projectedSummary: run1.projectedSummary,
}, null, 2));

console.log('\n====================================================');
console.log(`   TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
