// src/utils/orchestratorContext.js
// NutriMatch Phase 2 — Multi-Turn Conversational Context & Entity Extractor Engine

import { VILLAGES } from '../data/mockData.js';
import { normalizeMultilingualInventory } from './ragIntentParser.js';

/**
 * Initial empty conversation state
 */
export function createInitialContext(uiLanguage = 'en') {
  return {
    activeLocation: null,          // e.g. 'Sheopur'
    activeLocations: [],           // e.g. ['Sheopur', 'Bahraich'] for comparisons
    locationConstraint: 'NONE',    // 'HARD' | 'NONE'
    activeBudget: null,            // e.g. 50000
    activeInventory: [],           // e.g. [{ item_name: 'rice', quantity: 200, unit: 'kg' }]
    activePopulationGroup: 'children_6_59_months',
    activeLanguage: uiLanguage || 'en',
    currentTopic: null,            // 'donation' | 'nutrition' | 'optimization' | 'comparison' | 'evidence'
    recentMessages: [],
  };
}

/**
 * Extracts entities, locations, budgets, quantities, and explicit constraints from query text
 */
export function extractEntitiesAndConstraints(queryText, currentContext = null) {
  if (!queryText || typeof queryText !== 'string') {
    return {
      entities: {},
      updatedContext: currentContext || createInitialContext(),
    };
  }

  const context = currentContext ? { ...currentContext } : createInitialContext();
  const queryLower = queryText.toLowerCase();

  // 1. Language Detection (explicit > detected)
  const isHindi = /[\u0900-\u097F]/.test(queryText) && (queryText.includes('क्या') || queryText.includes('कहाँ') || queryText.includes('दान') || queryText.includes('चावल') || queryText.includes('नमक') || queryText.includes('किलो') || queryText.includes('में'));
  const isMarathi = /[\u0900-\u097F]/.test(queryText) && (queryText.includes('आहे') || queryText.includes('कुठे') || queryText.includes('तांदूळ') || queryText.includes('गहू') || queryText.includes('करावी') || queryText.includes('पहा') || queryText.includes('मध्ये'));

  if (isMarathi) context.activeLanguage = 'mr';
  else if (isHindi) context.activeLanguage = 'hi';
  else if (/[\u0900-\u097F]/.test(queryText)) context.activeLanguage = 'hi';

  // 2. Location Extraction (matching against known VILLAGES list)
  const matchedLocations = [];
  VILLAGES.forEach(v => {
    const vNameLower = v.name.toLowerCase();
    const vDistLower = v.district.toLowerCase();
    if (queryLower.includes(vNameLower) || queryLower.includes(vDistLower)) {
      if (!matchedLocations.includes(v.name)) {
        matchedLocations.push(v.name);
      }
    }
  });

  // Multilingual location aliases
  if (queryLower.includes('श्योपुर')) matchedLocations.push('Sheopur');
  if (queryLower.includes('बहराइच')) matchedLocations.push('Bahraich');
  if (queryLower.includes('वाशिम')) matchedLocations.push('Washim');
  if (queryLower.includes('पालघर')) matchedLocations.push('Palghar');
  if (queryLower.includes('बाड़मेर') || queryLower.includes('बाडमेर')) matchedLocations.push('Barmer');
  if (queryLower.includes('नंदुरबार')) matchedLocations.push('Nandurbar');
  if (queryLower.includes('धौलपुर')) matchedLocations.push('Dholpur');

  const uniqueLocations = Array.from(new Set(matchedLocations));

  // Context replacement / clearing rules
  if (queryLower.includes('forget') || queryLower.includes('clear') || queryLower.includes('only consider') || queryLower.includes('भूल जाओ') || queryLower.includes('फक्त')) {
    if (uniqueLocations.length > 0) {
      context.activeLocations = uniqueLocations;
      context.activeLocation = uniqueLocations[0];
      context.locationConstraint = 'HARD';
    } else {
      context.activeLocation = null;
      context.activeLocations = [];
      context.locationConstraint = 'NONE';
    }
  } else if (uniqueLocations.length > 1 || queryLower.includes('compare') || queryLower.includes('vs') || queryLower.includes('तुलना')) {
    context.activeLocations = uniqueLocations.length > 0 ? uniqueLocations : context.activeLocations;
    context.locationConstraint = 'NONE';
  } else if (uniqueLocations.length === 1) {
    context.activeLocation = uniqueLocations[0];
    context.activeLocations = [uniqueLocations[0]];
    // Explicit user location declaration sets HARD location constraint
    context.locationConstraint = 'HARD';
  }

  // 3. Budget Extraction (e.g., ₹50,000, 1 lakh, 50000, 10,000)
  const budgetMatch = queryText.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(lakh|lakhs|लाख)?/i);
  if (budgetMatch) {
    let amount = parseFloat(budgetMatch[1].replace(/,/g, ''));
    if (budgetMatch[2]) {
      amount = amount * 100000; // 1 lakh = 100,000
    }
    if (amount >= 500) {
      context.activeBudget = amount;
    }
  }

  // 4. Inventory Extraction
  const extractedInventory = normalizeMultilingualInventory(queryText);
  if (extractedInventory.length > 0) {
    context.activeInventory = extractedInventory;
  }

  // 5. Nutrient / Food extraction
  let targetNutrient = null;
  if (queryLower.includes('iron') || queryLower.includes('आयरन') || queryLower.includes('आयर्न') || queryLower.includes('anaemia') || queryLower.includes('anemia')) targetNutrient = 'iron';
  else if (queryLower.includes('zinc') || queryLower.includes('जिंक')) targetNutrient = 'zinc';
  else if (queryLower.includes('folate') || queryLower.includes('folic') || queryLower.includes('फोलेट')) targetNutrient = 'folate';
  else if (queryLower.includes('vitamin a') || queryLower.includes('विटामिन')) targetNutrient = 'vitamin_a';
  else if (queryLower.includes('iodine') || queryLower.includes('आयोडीन')) targetNutrient = 'iodine';

  return {
    entities: {
      locations: uniqueLocations,
      location: context.activeLocation,
      locationConstraint: context.locationConstraint,
      budget: context.activeBudget,
      inventory: context.activeInventory,
      targetNutrient,
    },
    updatedContext: context,
  };
}
