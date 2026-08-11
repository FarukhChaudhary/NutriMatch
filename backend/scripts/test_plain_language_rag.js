// backend/scripts/test_plain_language_rag.js
// Master Verification Suite for Plain-Language & Multilingual RAG Assistant

import { detectUserIntent, normalizeMultilingualInventory } from '../../src/utils/ragIntentParser.js';
import { queryRAGKnowledge } from '../../src/utils/ragEngine.js';
import { getProtectedHealthClaimExplanation } from '../../src/utils/ragTerminology.js';

console.log('====================================================');
console.log('   PLAIN-LANGUAGE & MULTILINGUAL RAG VERIFICATION   ');
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

// Test 1: Multilingual Quantity & Unit Normalization (English, Hindi, Marathi)
console.log('[Test 1] Testing multilingual quantity & unit normalization...');

const enParsed = normalizeMultilingualInventory('I want to donate 200 kg rice and 5 quintals wheat');
assert(enParsed.length === 2, 'English parsed 2 items');
assert(enParsed[0].quantity === 200 && enParsed[0].item_name === 'rice', 'English: 200 kg rice parsed');
assert(enParsed[1].quantity === 500 && enParsed[1].unit === 'kg', 'English: 5 quintals normalized to 500 kg');

const hiParsed = normalizeMultilingualInventory('मैं 200 किलो चावल और 2 कुंतल गेहूं दान करना चाहता हूँ');
assert(hiParsed.length === 2, 'Hindi parsed 2 items');
assert(hiParsed[0].quantity === 200 && hiParsed[0].item_name === 'rice', 'Hindi: 200 किलो चावल parsed');
assert(hiParsed[1].quantity === 200 && hiParsed[1].unit === 'kg', 'Hindi: 2 कुंतल गेहूं normalized to 200 kg');

const mrParsed = normalizeMultilingualInventory('मला 200 किलो तांदूळ आणि 2 क्विंटल गव्हाचे योगदान द्यायचे आहे');
assert(mrParsed.length === 2, 'Marathi parsed 2 items');
assert(mrParsed[0].quantity === 200 && mrParsed[0].item_name === 'rice', 'Marathi: 200 किलो तांदूळ parsed');
assert(mrParsed[1].quantity === 200 && mrParsed[1].unit === 'kg', 'Marathi: 2 क्विंटल गव्हाचे normalized to 200 kg');

// Test 2: Health-Claim Protection (No clinical cure claims)
console.log('\n[Test 2] Testing Health-Claim Protection on food suitability...');
const healthClaimEN = getProtectedHealthClaimExplanation('Jaggery', 'iron', 'en');
assert(!healthClaimEN.explanation.toLowerCase().includes('treats anemia'), 'Does NOT claim jaggery treats anemia');
assert(healthClaimEN.explanation.includes('ICMR-NIN IFCT 2017 Code A012'), 'Includes verified ICMR-NIN IFCT 2017 citation code');
assert(healthClaimEN.healthClaimNotice.includes('Does not replace clinical diagnosis'), 'Includes clinical disclaimers');

const healthClaimHI = getProtectedHealthClaimExplanation('गुड़', 'iron', 'hi');
assert(!healthClaimHI.explanation.includes('इलाज करता है'), 'Hindi explanation avoids clinical cure claims');

// Test 3: Donor Location Query & 9-Section Response Formulation
console.log('\n[Test 3] Testing Donor Location Query (9-Section Structure & Multilingual)...');
const donorResultEN = queryRAGKnowledge('I have 200 kg rice and 200 kg wheat. Where can I donate it?', { language: 'en' });
assert(donorResultEN.intent === 'DONATION_LOCATION', 'Detected DONATION_LOCATION intent');
assert(donorResultEN.sections.recommendedLocations.length > 0, 'Generated recommended locations array');
assert(donorResultEN.sections.estimatedReach.beneficiaries > 0, 'Calculated estimated reach beneficiaries');
assert(donorResultEN.technicalDetails.toggleLabel === 'View technical details', 'Technical details toggle label set to English');

const donorResultHI = queryRAGKnowledge('मेरे पास 200 किलो चावल और 200 किलो गेहूं है। मैं इसे कहाँ दान कर सकता हूँ?', { language: 'hi' });
assert(donorResultHI.language === 'hi', 'Language correctly set to Hindi (hi)');
assert(donorResultHI.technicalDetails.toggleLabel === 'वैज्ञानिक जानकारी देखें', 'Hindi technical toggle label: "वैज्ञानिक जानकारी देखें"');

const donorResultMR = queryRAGKnowledge('माझ्याकडे 200 किलो तांदूळ आणि 200 किलो गहू आहे. मी ते कुठे दान करू शकतो?', { language: 'mr' });
assert(donorResultMR.language === 'mr', 'Language correctly set to Marathi (mr)');
assert(donorResultMR.technicalDetails.toggleLabel === 'तांत्रिक माहिती पहा', 'Marathi technical toggle label: "तांत्रिक माहिती पहा"');

// Test 4: RAG Deduplication & Grounded Evidence Section
console.log('\n[Test 4] Verifying evidence section metadata...');
assert(donorResultEN.evidence.source.includes('NFHS-5'), 'Compact evidence section cites NFHS-5');
assert(donorResultEN.evidence.confidence === 'MEDIUM', 'Confidence level present on evidence panel');

console.log('\n[Test 5] Sample Plain-Language Output Structure:');
console.log(JSON.stringify({
  explanation: donorResultEN.explanation,
  recommendedLocations: donorResultEN.sections.recommendedLocations,
  technicalToggle: donorResultEN.technicalDetails.toggleLabel,
}, null, 2));

console.log('\n====================================================');
console.log(`   TEST SUMMARY: ${passCount} Passed, ${failCount} Failed`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
}
