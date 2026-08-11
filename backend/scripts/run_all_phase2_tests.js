// backend/scripts/run_all_phase2_tests.js
// Master Test Runner for NutriMatch Phase 2 Controlled Implementation

import { execSync } from 'child_process';

console.log('====================================================');
console.log('   NUTRIMATCH PHASE 2 MASTER INTEGRATION TEST SUITE ');
console.log('====================================================\n');

const testScripts = [
  { name: 'Step 1: Database & Evidence Foundation', script: 'backend/scripts/test_evidence.js' },
  { name: 'Step 2: Nutrition Profile Engine', script: 'backend/scripts/test_nutrition_profile.js' },
  { name: 'Step 3: Aid Gap Intelligence & Matrix', script: 'backend/scripts/test_aid_gap.js' },
  { name: 'Step 4: Food Inventory Matching', script: 'backend/scripts/test_inventory.js' },
  { name: 'Step 5: Deterministic Resource Optimization', script: 'backend/scripts/test_optimization.js' },
  { name: 'Step 6 (Part A): RAG Retrieval & Citations', script: 'backend/scripts/test_rag.js' },
  { name: 'Step 6 (Part B): RAG Grounding & Safety Guard', script: 'backend/scripts/test_rag_grounding.js' },
  { name: 'Step 6 (Part C): Plain-Language & Multilingual RAG', script: 'backend/scripts/test_plain_language_rag.js' },
  { name: 'Step 7: Donor Intelligence & Transparency', script: 'backend/scripts/test_donor.js' },
  { name: 'Step 8: Natural Language AI Orchestrator & Regression', script: 'backend/scripts/test_orchestrator.js' },
];

let totalPassedSuites = 0;

for (const test of testScripts) {
  console.log(`▶ Executing ${test.name} (${test.script})...`);
  try {
    const output = execSync(`node ${test.script}`, { encoding: 'utf-8' });
    console.log(output);
    totalPassedSuites++;
  } catch (error) {
    console.error(`❌ FAILED Test Suite: ${test.name}`);
    console.error(error.stdout || error.message);
    process.exit(1);
  }
}

console.log('====================================================');
console.log(`   ALL ${totalPassedSuites} PHASE 2 TEST SUITES PASSED CLEANLY! `);
console.log('====================================================');
