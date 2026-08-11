// backend/scripts/test_evidence.js
// Verification suite for Step 1 — Database & Evidence Foundation

import { createEvidenceRecord, calculateEvidenceConfidence, getGeographicDisclaimer } from '../../src/utils/evidenceEngine.js';

console.log('====================================================');
console.log('   STEP 1 VERIFICATION: EVIDENCE & CONFIDENCE MODEL ');
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

// Test 1: Separated Confidence Metrics
console.log('[Test 1] Verifying separated confidence metrics...');
const districtAnaemiaRecord = createEvidenceRecord({
  indicatorCode: 'NFHS5_CHILD_ANAEMIA',
  indicatorName: 'Anaemia Prevalence in Children (6-59 months)',
  value: 71.2,
  geographyLevel: 'district',
  geographyId: 'v1',
  geographyName: 'Washim',
  sourceGeography: 'Washim District, Maharashtra',
  populationGroup: 'children_6_59_months',
  sourceAuthority: 'Ministry of Health and Family Welfare (MoHFW) / IIPS',
  sourceDocument: 'NFHS-5 District Factsheet',
  surveyYear: '2019-2021',
});

assert(districtAnaemiaRecord.source_reliability === 'HIGH', 'Source reliability is HIGH for MoHFW/IIPS NFHS-5 data');
assert(districtAnaemiaRecord.geography_specificity === 'MEDIUM', 'Geography specificity is MEDIUM when applying district data to a village');
assert(districtAnaemiaRecord.population_specificity === 'HIGH', 'Population specificity is HIGH when matching children 6-59 months');
assert(districtAnaemiaRecord.data_recency === 'MEDIUM', 'Data recency is MEDIUM for 2019-2021 survey data evaluated in 2026');
assert(districtAnaemiaRecord.overall_confidence === 'MEDIUM', 'Overall confidence is MEDIUM due to district-level geographic resolution');

// Test 2: Mandatory Geographic Disclaimer
console.log('\n[Test 2] Verifying mandatory geographic disclaimer...');
const disclaimer = getGeographicDisclaimer('district', 'village');
assert(
  disclaimer === 'Village-level direct measurement unavailable. This insight uses the latest available district-level evidence.',
  'District-to-village mapping generates exact mandatory disclaimer text'
);

// Test 3: Indicator Terminology Preservation
console.log('\n[Test 3] Verifying indicator terminology preservation...');
assert(
  districtAnaemiaRecord.indicator_name === 'Anaemia Prevalence in Children (6-59 months)',
  'Indicator name preserves Anaemia Prevalence and does not substitute unconfirmed iron deficiency'
);

// Test 4: Structured Output Summary
console.log('\n[Test 4] Sample Evidence Record Structure:');
console.log(JSON.stringify(districtAnaemiaRecord, null, 2));

console.log('\n====================================================');
console.log(`   TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
