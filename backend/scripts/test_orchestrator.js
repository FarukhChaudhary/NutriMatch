// backend/scripts/test_orchestrator.js
// Master Verification Suite for Natural Language AI Orchestrator & Scenarios A through J

import { createInitialContext, extractEntitiesAndConstraints } from '../../src/utils/orchestratorContext.js';
import { queryRAGKnowledge } from '../../src/utils/ragEngine.js';
import { calculateNutrientContribution } from '../../src/utils/inventoryMatcher.js';

console.log('====================================================');
console.log('   AI ORCHESTRATOR & SCENARIOS A-J TEST SUITE      ');
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

// ----------------------------------------------------
// SCENARIO A & F & G: Food Matching Hierarchy & Safety
// ----------------------------------------------------
console.log('--- [SCENARIO A, F & G: Plain vs Fortified Rice Safety] ---');

console.log('Test F: "I have 200 kg rice." (Plain Rice)');
const plainRes = calculateNutrientContribution([{ item_name: 'rice', quantity: 200, unit: 'kg' }]);
assert(plainRes.itemBreakdown[0].foodCode === 'A003', 'Plain rice mapped to Code A003 (Raw Milled Rice)');
assert(plainRes.totals.ironMg === 1400, 'Plain rice yields 1,400mg iron (0.7mg/100g x 2000), NOT 40,000mg');
assert(plainRes.itemBreakdown[0].assumptionNotice.includes('plain unfortified white rice'), 'Explicit plain rice assumption notice attached');

console.log('\nTest G: "I have 200 kg iron-fortified rice." (Fortified Rice)');
const fortRes = calculateNutrientContribution([{ item_name: 'iron-fortified rice', quantity: 200, unit: 'kg' }]);
assert(fortRes.itemBreakdown[0].foodCode === 'A001', 'Fortified rice mapped to Code A001 (Fortified Rice)');
assert(fortRes.totals.ironMg === 40000, 'Fortified rice yields 40,000mg iron (20mg/100g x 2000)');

// ----------------------------------------------------
// SCENARIO B: Quantity Sensitivity
// ----------------------------------------------------
console.log('\n--- [SCENARIO B: Quantitative Scale & Reach Sensitivity] ---');

const q1 = calculateNutrientContribution([{ item_name: 'rice', quantity: 1, unit: 'kg' }]);
const q200 = calculateNutrientContribution([{ item_name: 'rice', quantity: 200, unit: 'kg' }]);
const q1000 = calculateNutrientContribution([{ item_name: 'rice', quantity: 1000, unit: 'kg' }]);

assert(q1.estimatedImpact.maxBeneficiaries30Days === 0 || q1.estimatedImpact.maxBeneficiaries30Days === 1, '1kg plain rice reaches ~0-1 children');
assert(q200.estimatedImpact.maxBeneficiaries30Days === 17, '200kg plain rice reaches ~17 children for 30 days (Zinc peak nutrient yield)');
assert(q1000.estimatedImpact.maxBeneficiaries30Days === 87, '1,000kg plain rice reaches ~87 children for 30 days (Zinc peak nutrient yield)');

// ----------------------------------------------------
// SCENARIO C & D: Location & State Geographic Constraints
// ----------------------------------------------------
console.log('\n--- [SCENARIO C & D: State & Location Geographic Constraints] ---');

console.log('Scenario C: "I have 200 kg rice and want to donate it in Sheopur."');
const scC = queryRAGKnowledge('I have 200 kg rice and want to donate it in Sheopur.');
assert(scC.activeContext.activeLocation === 'Sheopur', 'Extracted activeLocation = Sheopur');
assert(scC.sections.recommendedLocations.length === 1 && scC.sections.recommendedLocations[0].location.includes('Sheopur'), 'Evaluated ONLY Sheopur');

console.log('\nScenario D1: "I have 200 kg rice. Where should I donate in Maharashtra?"');
const scD1 = queryRAGKnowledge('I have 200 kg rice. Where should I donate in Maharashtra?');
assert(scD1.activeContext.activeState === 'Maharashtra', 'Extracted activeState = Maharashtra');
assert(scD1.sections.recommendedLocations.every(l => l.location.includes('Maharashtra')), 'All recommended locations belong ONLY to Maharashtra (Washim, Nandurbar, Palghar)');

console.log('\nScenario D2: "I have 200 kg rice. Where should I donate in Rajasthan?"');
const scD2 = queryRAGKnowledge('I have 200 kg rice. Where should I donate in Rajasthan?');
assert(scD2.activeContext.activeState === 'Rajasthan', 'Extracted activeState = Rajasthan');
assert(scD2.sections.recommendedLocations.every(l => l.location.includes('Rajasthan')), 'All recommended locations belong ONLY to Rajasthan (Dholpur, Barmer)');

console.log('\nScenario D3: "I have 200 kg rice. Where should I donate in Uttar Pradesh?"');
const scD3 = queryRAGKnowledge('I have 200 kg rice. Where should I donate in Uttar Pradesh?');
assert(scD3.activeContext.activeState === 'Uttar Pradesh', 'Extracted activeState = Uttar Pradesh');
assert(scD3.sections.recommendedLocations.every(l => l.location.includes('Uttar Pradesh')), 'All recommended locations belong ONLY to Uttar Pradesh (Bahraich, Chandauli)');

console.log('\nScenario D4: "I have 200 kg rice. Where should I donate in Madhya Pradesh?"');
const scD4 = queryRAGKnowledge('I have 200 kg rice. Where should I donate in Madhya Pradesh?');
assert(scD4.activeContext.activeState === 'Madhya Pradesh', 'Extracted activeState = Madhya Pradesh');
assert(scD4.sections.recommendedLocations.every(l => l.location.includes('Madhya Pradesh')), 'All recommended locations belong ONLY to Madhya Pradesh (Sheopur)');

// ----------------------------------------------------
// SCENARIO E: Location Comparison
// ----------------------------------------------------
console.log('\n--- [SCENARIO E: Location Comparison] ---');
console.log('Scenario E: "Compare Sheopur and Bahraich for my 200 kg rice donation."');
const scE = queryRAGKnowledge('Compare Sheopur and Bahraich for my 200 kg rice donation.');
assert(scE.sections.recommendedLocations.length === 2, 'Comparison evaluated exactly Sheopur and Bahraich side-by-side');

// ----------------------------------------------------
// SCENARIO H & I: Budget Recommendations
// ----------------------------------------------------
console.log('\n--- [SCENARIO H & I: Budget Recommendations] ---');
console.log('Scenario H: "I have ₹50,000. Where should I donate?"');
const scH = queryRAGKnowledge('I have ₹50,000. Where should I donate?');
assert(scH.activeContext.activeBudget === 50000, 'Parsed activeBudget = 50,000');

console.log('Scenario I: "I have ₹50,000 and want to donate in Sheopur."');
const scI = queryRAGKnowledge('I have ₹50,000 and want to donate in Sheopur.');
assert(scI.activeContext.activeLocation === 'Sheopur' && scI.activeContext.activeBudget === 50000, 'Parsed ₹50,000 in Sheopur');

// ----------------------------------------------------
// SCENARIO J: Multi-Turn Context Flow
// ----------------------------------------------------
console.log('\n--- [SCENARIO J: Multi-Turn Context Memory Flow] ---');
let ctx = createInitialContext('en');

const turn1 = queryRAGKnowledge('Tell me about Sheopur.', { previousContext: ctx });
ctx = turn1.activeContext;
assert(ctx.activeLocation === 'Sheopur', 'Turn 1: Remembered activeLocation = Sheopur');

const turn2 = queryRAGKnowledge('What should I donate?', { previousContext: ctx });
ctx = turn2.activeContext;
assert(turn2.explanation.includes('Sheopur'), 'Turn 2: Applied activeLocation = Sheopur automatically');

const turn3 = queryRAGKnowledge('I have 200 kg rice.', { previousContext: ctx });
ctx = turn3.activeContext;
assert(ctx.activeLocation === 'Sheopur', 'Turn 3: Sheopur remains active location for 200kg rice');

const turn4 = queryRAGKnowledge('Actually, compare it with Bahraich.', { previousContext: ctx });
assert(turn4.sections.recommendedLocations.length === 2, 'Turn 4: Updated context to compare Sheopur + Bahraich');

console.log('\n====================================================');
console.log(`   TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
