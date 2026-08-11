// src/utils/ragIntentParser.js
// NutriMatch Phase 2 — Multilingual Intent Detection, Quantity Parsing & Unit Normalization Engine

/**
 * Supported Intents
 */
export const INTENTS = {
  DONATION_LOCATION: 'DONATION_LOCATION',
  FOOD_SUITABILITY: 'FOOD_SUITABILITY',
  NUTRITION_EXPLANATION: 'NUTRITION_EXPLANATION',
  VILLAGE_ANALYSIS: 'VILLAGE_ANALYSIS',
  COMPARISON: 'COMPARISON',
  TECHNICAL_DETAILS: 'TECHNICAL_DETAILS',
  GENERAL_NUTRITION: 'GENERAL_NUTRITION',
};

/**
 * Detects user intent and query language
 */
export function detectUserIntent(queryText) {
  if (!queryText || typeof queryText !== 'string') {
    return { intent: INTENTS.GENERAL_NUTRITION, language: 'en' };
  }

  const queryLower = queryText.toLowerCase();

  // Language detection
  const isHindi = /[\u0900-\u097F]/.test(queryText) && (queryText.includes('क्या') || queryText.includes('कहाँ') || queryText.includes('दान') || queryText.includes('चावल') || queryText.includes('नमक') || queryText.includes('किलो'));
  const isMarathi = /[\u0900-\u097F]/.test(queryText) && (queryText.includes('आहे') || queryText.includes('कुठे') || queryText.includes('तांदूळ') || queryText.includes('गहू') || queryText.includes('करावी') || queryText.includes('पहा'));

  let language = 'en';
  if (isMarathi) language = 'mr';
  else if (isHindi) language = 'hi';
  else if (/[\u0900-\u097F]/.test(queryText)) language = 'hi'; // Default Devanagari script to Hindi if ambiguous

  // Intent classification
  if (
    queryLower.includes('donate') || queryLower.includes('donation') || queryLower.includes('where can i') ||
    queryLower.includes('दान') || queryLower.includes('कहाँ') || queryLower.includes('कुठे') ||
    queryLower.includes('kg') || queryLower.includes('kilogram') || queryLower.includes('quintal') || queryLower.includes('किलो') || queryLower.includes('कुंतल') || queryLower.includes('क्विंटल')
  ) {
    return { intent: INTENTS.DONATION_LOCATION, language };
  }

  if (
    queryLower.includes('why not') || queryLower.includes('compare') || queryLower.includes('vs') ||
    queryLower.includes('तुलना') || queryLower.includes('बजाय')
  ) {
    return { intent: INTENTS.COMPARISON, language };
  }

  if (
    queryLower.includes('is ') && (queryLower.includes('good') || queryLower.includes('suitable') || queryLower.includes('help')) ||
    queryLower.includes('अच्छा') || queryLower.includes('फायदेमंद') || queryLower.includes('योग्य')
  ) {
    return { intent: INTENTS.FOOD_SUITABILITY, language };
  }

  if (
    queryLower.includes('ppm') || queryLower.includes('specification') || queryLower.includes('mg/kg') ||
    queryLower.includes('तकनीकी') || queryLower.includes('तांत्रिक')
  ) {
    return { intent: INTENTS.TECHNICAL_DETAILS, language };
  }

  if (
    queryLower.includes('status of') || queryLower.includes('anemia rate in') || queryLower.includes('village') ||
    queryLower.includes('गाँव') || queryLower.includes('गाव')
  ) {
    return { intent: INTENTS.VILLAGE_ANALYSIS, language };
  }

  if (
    queryLower.includes('what is') || queryLower.includes('meaning of') || queryLower.includes('explain') ||
    queryLower.includes('क्या है') || queryLower.includes('म्हणजे काय')
  ) {
    return { intent: INTENTS.NUTRITION_EXPLANATION, language };
  }

  return { intent: INTENTS.GENERAL_NUTRITION, language };
}

/**
 * Normalizes multilingual quantity and food name inputs into canonical JSON
 */
export function normalizeMultilingualInventory(queryText) {
  if (!queryText || typeof queryText !== 'string') return [];

  const items = [];

  // Multilingual Food dictionary mapping
  const foodDictionary = [
    { canonical: 'rice', matches: ['rice', 'चावल', 'तांदूळ', 'चावल,'] },
    { canonical: 'wheat', matches: ['wheat', 'गेहूं', 'गहू', 'गव्हाचे'] },
    { canonical: 'dal', matches: ['dal', 'lentil', 'lentils', 'दाल', 'डाळ', 'मसूर'] },
    { canonical: 'salt', matches: ['salt', 'नमक', 'मीठ'] },
    { canonical: 'jaggery', matches: ['jaggery', 'gur', 'गुड़', 'गुळ'] },
  ];

  // Regex for quantity extraction matching English, Hindi, and Devanagari numerals
  // Examples: "200 kg rice", "200 किलो चावल", "2 कुंतल गेहूं", "2 क्विंटल गव्हाचे", "5 quintals"
  const pattern = /(\d+(?:\.\d+)?|\b[\u0966-\u096F]+\b)\s*(kg|kgs|kilogram|kilograms|quintal|quintals|किलो|किलोग्राम|कुंतल|क्विंटल)?\s+([a-zA-Z\u0900-\u097F]+)/gi;

  let match;
  while ((match = pattern.exec(queryText)) !== null) {
    let rawQty = match[1];

    // Convert Devanagari digits (०-९) to ASCII digits (0-9)
    rawQty = rawQty.replace(/[\u0966-\u096F]/g, d => d.charCodeAt(0) - 0x0966);
    let qty = parseFloat(rawQty);

    const rawUnit = (match[2] || 'kg').toLowerCase();
    const rawFood = match[3].toLowerCase();

    // Canonical unit normalization
    let unit = 'kg';
    if (rawUnit.includes('quintal') || rawUnit.includes('कुंतल') || rawUnit.includes('क्विंटल')) {
      qty = qty * 100; // 1 quintal = 100 kg
      unit = 'kg';
    }

    // Canonical food name normalization
    const matchedFoodObj = foodDictionary.find(fd =>
      fd.matches.some(m => rawFood.includes(m) || m.includes(rawFood))
    );

    if (matchedFoodObj && qty > 0) {
      items.push({
        item_name: matchedFoodObj.canonical,
        quantity: qty,
        unit: unit,
      });
    }
  }

  return items;
}
