// backend/scripts/test_rag.js
// Verification suite for Step 6 — RAG Document Retrieval & Citation Extraction

import { queryRAGKnowledge, MEDICAL_DISCLAIMER } from '../../src/utils/ragEngine.js';

console.log('====================================================');
console.log('   STEP 6 VERIFICATION: RAG RETRIEVAL & CITATIONS   ');
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

// Test 1: Querying NFHS-5 Child Anaemia Evidence
console.log('[Test 1] Querying NFHS-5 Child Anaemia evidence...');
const result1 = queryRAGKnowledge('What does NFHS data say about child anaemia prevalence?');

assert(result1.queryGrounded === true, 'Query successfully grounded in evidence');
assert(result1.answer.includes('NFHS-5'), 'Answer includes reference to NFHS-5 survey');
assert(result1.citations.length > 0, `Retrieved ${result1.citations.length} valid citation(s)`);
assert(result1.citations[0].organization === 'Ministry of Health and Family Welfare (MoHFW) / IIPS Mumbai', 'Citation authority correctly attributes MoHFW / IIPS');
assert(typeof result1.disclaimer === 'string' && result1.disclaimer.includes('Notice:'), 'Medical disclaimer present on output');

// Test 2: Querying ICMR-NIN IFCT 2017 Food Composition
console.log('\n[Test 2] Querying ICMR-NIN IFCT 2017 food composition...');
const result2 = queryRAGKnowledge('What is the iron content of Moringa leaves and Jaggery according to NIN?');

assert(result2.queryGrounded === true, 'Food query grounded');
assert(result2.answer.includes('28.2mg iron'), 'Exact verified IFCT nutrient figure (28.2mg iron) retrieved');
assert(result2.citations.some(c => c.organization.includes('NIN')), 'Citation includes ICMR-NIN attribution');

// Test 3: Querying FSSAI Fortification Standards
console.log('\n[Test 3] Querying FSSAI Double Fortified Salt standards...');
const result3 = queryRAGKnowledge('What are the FSSAI standards for Double Fortified Salt?');

assert(result3.queryGrounded === true, 'Fortification query grounded');
assert(result3.answer.includes('30 PPM Iodine'), 'Retrieved exact FSSAI standard (30 PPM Iodine + 800-1100 PPM Iron)');
assert(result3.citations.some(c => c.organization.includes('FSSAI')), 'Citation includes FSSAI attribution');

console.log('\n[Test 4] Sample RAG Query Result:');
console.log(JSON.stringify(result1, null, 2));

console.log('\n====================================================');
console.log(`   TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
