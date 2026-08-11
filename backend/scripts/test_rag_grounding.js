// backend/scripts/test_rag_grounding.js
// Verification suite for Step 6 — RAG Safety, Grounding & Refusal of Out-of-Scope Queries

import { queryRAGKnowledge, INSUFFICIENT_EVIDENCE_RESPONSE, MEDICAL_DISCLAIMER } from '../../src/utils/ragEngine.js';

console.log('====================================================');
console.log('   STEP 6 VERIFICATION: RAG GROUNDING & SAFETY     ');
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

// Test 1: Out-of-scope query refusal
console.log('[Test 1] Testing out-of-scope sports query refusal...');
const outOfScopeResult = queryRAGKnowledge('Who won the cricket world cup match yesterday?');

assert(outOfScopeResult.queryGrounded === false, 'Out-of-scope query correctly marked as ungrounded');
assert(
  outOfScopeResult.answer === INSUFFICIENT_EVIDENCE_RESPONSE.en || outOfScopeResult.answer === INSUFFICIENT_EVIDENCE_RESPONSE || outOfScopeResult.answer.includes('designed to help'),
  'Returns polite out-of-domain refusal message'
);
assert(outOfScopeResult.citations.length === 0, 'Zero citations fabricated for ungrounded query');
assert(typeof outOfScopeResult.disclaimer === 'string' && outOfScopeResult.disclaimer.includes('Notice:'), 'Medical disclaimer present on response');

// Test 2: Irrelevant medical prescription query refusal
console.log('\n[Test 2] Testing individual medical diagnosis/prescription query handling...');
const prescriptionResult = queryRAGKnowledge('Prescribe antibiotic dosage for 5 year old child fever');

assert(prescriptionResult.queryGrounded === false, 'Clinical prescription query refused by RAG safety guard');
assert(
  prescriptionResult.answer === INSUFFICIENT_EVIDENCE_RESPONSE.en || prescriptionResult.answer === INSUFFICIENT_EVIDENCE_RESPONSE,
  'Refuses to provide unsupported clinical diagnosis/prescription'
);
assert(prescriptionResult.citations.length === 0, 'Zero fabricated citations');

// Test 3: Citation Verification on Grounded Query
console.log('\n[Test 3] Verifying citation metadata structure on grounded query...');
const groundedResult = queryRAGKnowledge('What are the WHO guidelines on zinc supplementation for diarrhoea?');

assert(groundedResult.queryGrounded === true, 'WHO query grounded');
assert(groundedResult.citations.length > 0, 'Valid citation array returned');
assert(groundedResult.citations.some(c => c.url.includes('who.int')), 'Citation contains valid source URL');
assert(groundedResult.citations.some(c => c.population_group === 'children_0_5'), 'Citation includes population_group metadata');
assert(groundedResult.citations.some(c => c.geographic_scope === 'global'), 'Citation includes geographic_scope metadata');

console.log('\n====================================================');
console.log(`   TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
