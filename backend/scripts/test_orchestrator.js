// backend/scripts/test_orchestrator.js
// Master Verification Suite for General-Purpose Natural Language AI Orchestrator & Mandatory Regression Tests

import { createInitialContext, extractEntitiesAndConstraints } from '../../src/utils/orchestratorContext.js';
import { queryRAGKnowledge } from '../../src/utils/ragEngine.js';

console.log('====================================================');
console.log('   AI ORCHESTRATOR & REGRESSION TEST SUITE         ');
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
// MANDATORY REGRESSION TEST FOR SHEOPUR/BAHRAICH BUG
// ----------------------------------------------------
console.log('--- [REGRESSION SUITE: Hard Location Constraints] ---');

// Query 1: Unconstrained Global Donation
console.log('[Regression 1] "I have 200 kg rice and 200 kg wheat. Where should I donate?"');
const reg1 = queryRAGKnowledge('I have 200 kg rice and 200 kg wheat. Where should I donate?');
assert(reg1.sections.recommendedLocations.length >= 2, 'Unconstrained donation ranks multiple candidate locations');

// Query 2: Explicit Location Constraint ("in Sheopur")
console.log('[Regression 2] "I want to donate something in Sheopur. What should I donate?"');
const reg2 = queryRAGKnowledge('I want to donate something in Sheopur. What should I donate?');
assert(reg2.activeContext.activeLocation === 'Sheopur', 'Extracted activeLocation = Sheopur');
assert(reg2.activeContext.locationConstraint === 'HARD', 'Location constraint locked to HARD');
assert(reg2.sections.recommendedLocations[0].location.includes('Sheopur'), 'Recommended location strictly constrained to Sheopur');
assert(!reg2.explanation.includes('Bahraich'), 'Does NOT redirect user to Bahraich when locked to Sheopur');

// Query 3: Location + Inventory Constraint
console.log('[Regression 3] "I have 200 kg rice and 200 kg wheat and want to donate it in Sheopur."');
const reg3 = queryRAGKnowledge('I have 200 kg rice and 200 kg wheat and want to donate it in Sheopur.');
assert(reg3.activeContext.activeLocation === 'Sheopur', 'Extracted Sheopur');
assert(reg3.activeContext.locationConstraint === 'HARD', 'HARD location constraint preserved');
assert(reg3.sections.whyThisLocation.includes('Sheopur'), 'Evaluates strictly within Sheopur');

// Query 4: Explicit Location Comparison
console.log('[Regression 4] "Compare Sheopur and Bahraich."');
const reg4 = queryRAGKnowledge('Compare Sheopur and Bahraich.');
assert(reg4.sections.recommendedLocations.length === 2, 'Comparison evaluates exactly both locations side-by-side');

// ----------------------------------------------------
// MULTI-TURN CONVERSATIONAL CONTEXT TEST FLOW
// ----------------------------------------------------
console.log('\n--- [CONVERSATIONAL FLOW: Multi-Turn Context Memory] ---');

let context = createInitialContext('en');

// Turn 1
console.log('Turn 1: "Tell me about Sheopur."');
const turn1 = queryRAGKnowledge('Tell me about Sheopur.', { previousContext: context });
context = turn1.activeContext;
assert(context.activeLocation === 'Sheopur', 'Turn 1 remembered activeLocation = Sheopur');

// Turn 2
console.log('Turn 2: "What should I donate?" (without repeating Sheopur)');
const turn2 = queryRAGKnowledge('What should I donate?', { previousContext: context });
context = turn2.activeContext;
assert(turn2.explanation.includes('Sheopur'), 'Turn 2 automatically applied activeLocation = Sheopur from context');

// Turn 3
console.log('Turn 3: "I have ₹50,000." (without repeating Sheopur)');
const turn3 = queryRAGKnowledge('I have ₹50,000.', { previousContext: context });
context = turn3.activeContext;
assert(context.activeBudget === 50000, 'Turn 3 remembered activeBudget = 50,000');
assert(turn3.explanation.includes('Sheopur') && turn3.explanation.includes('50,000'), 'Turn 3 optimized ₹50,000 in Sheopur');

// Turn 4
console.log('Turn 4: "Compare this with Bahraich."');
const turn4 = queryRAGKnowledge('Compare this with Bahraich.', { previousContext: context });
assert(turn4.sections.recommendedLocations.length === 2, 'Turn 4 compared Sheopur and Bahraich using context');

// ----------------------------------------------------
// MULTILINGUAL & HEALTH-CLAIM PROTECTION SUITE
// ----------------------------------------------------
console.log('\n--- [MULTILINGUAL & SAFETY SUITE] ---');

console.log('Hindi: "श्योपुर में मुझे क्या दान करना चाहिए?"');
const hiResult = queryRAGKnowledge('श्योपुर में मुझे क्या दान करना चाहिए?', { language: 'hi' });
assert(hiResult.activeContext.activeLocation === 'Sheopur', 'Hindi extracted Sheopur location');
assert(hiResult.technicalDetails.toggleLabel === 'वैज्ञानिक जानकारी देखें', 'Hindi technical toggle label present');

console.log('Marathi: "माझ्याकडे 200 किलो तांदूळ आहे. श्योपुरमध्ये हे उपयोगी ठरेल का?"');
const mrResult = queryRAGKnowledge('माझ्याकडे 200 किलो तांदूळ आहे. श्योपुरमध्ये हे उपयोगी ठरेल का?', { language: 'mr' });
assert(mrResult.activeContext.activeLocation === 'Sheopur', 'Marathi extracted Sheopur location');
assert(mrResult.activeContext.activeInventory[0].quantity === 200, 'Marathi parsed 200 kg quantity');

console.log('\n====================================================');
console.log(`   TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
