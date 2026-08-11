// src/utils/ragTerminology.js
// NutriMatch Phase 2 — Controlled Multilingual Terminology Protection & Health-Claim Safety Dictionary

export const TERMINOLOGY_DICTIONARY = {
  FORTIFIED_RICE: {
    en: 'Rice with added vitamins and minerals.',
    hi: 'ऐसा चावल जिसमें अतिरिक्त विटामिन और खनिज मिलाए जाते हैं।',
    mr: 'ज्यामध्ये अतिरिक्त जीवनसत्त्वे आणि खनिजे मिसळलेली असतात असा तांदूळ.',
    tech_en: 'Fortified Rice Kernels (FRK) fortified with 28-42.5 mg iron/kg according to FSSAI operational standards.',
  },
  DOUBLE_FORTIFIED_SALT: {
    en: 'Salt enriched with added iron and iodine to address deficiency gaps simultaneously.',
    hi: 'आयरन और आयोडीन से भरपूर नमक जो एक साथ दोनों कमियों को पूरा करता है।',
    mr: 'आयर्न आणि आयोडिनने समृद्ध केलेले मीठ जे दोन्ही कमतरता एकाच वेळी दूर करते.',
    tech_en: 'Double Fortified Salt (DFS) containing 30 PPM Iodine and 800-1100 PPM Iron according to FSSAI standards.',
  },
  PPM: {
    en: 'A unit used to describe a very small concentration (parts per million).',
    hi: 'बहुत कम मात्रा की सांद्रता बताने के लिए इस्तेमाल होने वाली इकाई।',
    mr: 'अतिशय कमी प्रमाणातील सांद्रता दर्शविणारे एकक.',
    tech_en: 'Parts Per Million (PPM): 1 mg per kg or 1 mg per liter.',
  },
  ANAEMIA: {
    en: 'A condition where hemoglobin levels in red blood cells fall below normal standards (<11.0 g/dl in children 6-59 months).',
    hi: 'एक ऐसी स्थिति जहां लाल रक्त कोशिकाओं में हीमोग्लोबिन का स्तर सामान्य से कम हो जाता है।',
    mr: 'अशी स्थिती जिथे लाल रक्तपेशींमधील हिमोग्लोबिनचे प्रमाण सामान्यपेक्षा कमी होते.',
    tech_en: 'Anaemia Prevalence: Hemoglobin level <11.0 g/dl measured in survey children 6-59 months.',
  },
};

/**
 * Health-Claim Protection: Formulates non-clinical suitability explanations using verified IFCT 2017 data
 */
export function getProtectedHealthClaimExplanation(foodName, deficiencyType = 'iron', lang = 'en') {
  const isJaggery = foodName.toLowerCase().includes('jaggery') || foodName.includes('गुड़') || foodName.includes('गुळ');

  if (lang === 'hi') {
    return {
      explanation: isJaggery
        ? 'गुड (गुड़) में स्वाभाविक रूप से आयरन होता है (ICMR-NIN IFCT 2017 कोड A012 के अनुसार 11.4mg प्रति 100g)। हालांकि, गुड़ को एनीमिया का इलाज या डॉक्टरी दवा नहीं माना जाना चाहिए। इसका लाभ कुल आहार, सेवन की मात्रा और जनसंख्या समूह पर निर्भर करता है।'
        : `${foodName} में आवश्यक पोषक तत्व होते हैं, लेकिन इसे किसी बीमारी का इलाज या मेडिकल उपचार नहीं माना जाना चाहिए।`,
      healthClaimNotice: 'सुरक्षा सूचना: यह जानकारी केवल पोषण आहार सहायता के लिए है, किसी डॉक्टरी इलाज का दावा नहीं करती।',
    };
  }

  if (lang === 'mr') {
    return {
      explanation: isJaggery
        ? 'गुळामध्ये नैसर्गिकरित्या आयर्न असते (ICMR-NIN IFCT 2017 कोड A012 नुसार 11.4mg प्रति 100g). परंतु, गुळाला ॲनिमियावरील औषधी उपचार मानले जाऊ नये. त्याचा उपयोग एकूण आहार, सेवनाचे प्रमाण आणि वयोगटावर अवलंबून असतो.'
        : `${foodName} मध्ये पोषक घटक असतात, परंतु हा कोणत्याही वैद्यकीय आजारावरील थेट उपचार नाही.`,
      healthClaimNotice: 'सुरक्षा सूचना: ही माहिती केवळ सार्वजनिक पोषण आहारासाठी आहे.',
    };
  }

  // English
  return {
    explanation: isJaggery
      ? 'Jaggery contains natural iron (11.4mg per 100g according to ICMR-NIN IFCT 2017 Code A012). However, jaggery should not be considered a medical treatment or cure for anemia. Its nutritional usefulness depends on overall dietary diversity, total quantity consumed, and population group.'
      : `${foodName} provides valuable nutrients, but it should not be considered a clinical medical treatment or cure.`,
    healthClaimNotice: 'Notice: Public health dietary context only. Does not replace clinical diagnosis or medical treatment.',
  };
}
