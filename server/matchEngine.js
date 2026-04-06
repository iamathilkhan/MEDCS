/**
 * MEDCS Core Eligibility Matching Engine
 * 
 * This module handles the high-precision matching of citizen profiles 
 * to government welfare schemes using a multi-factor scoring system.
 */

/**
 * Matches a user profile against the schemes database.
 * 
 * @param {Object} profile - User's demographic and economic data.
 * @param {Array} schemes - Array of scheme objects from the database.
 * @returns {Array} - List of matched schemes with scores and personalized metadata.
 */
function matchSchemes(profile, schemes) {
  return schemes.map(scheme => {
    // Parse JSON fields if they are strings (from SQLite)
    const eligibility = typeof scheme.eligibility === 'string' ? JSON.parse(scheme.eligibility) : (scheme.eligibility || {});
    const documents = Array.isArray(scheme.documents) ? scheme.documents : 
                     (typeof scheme.documents === 'string' ? JSON.parse(scheme.documents) : []);

    let score = 0;
    const matchReasons = [];
    const missingDocs = [];

    // --- 1. Hard Filters (Mandatory) ---
    const age = parseInt(profile.age);
    const minAge = parseInt(eligibility.minAge) || 0;
    const maxAge = parseInt(eligibility.maxAge) || 120;
    const income = parseFloat(profile.annualIncome) || 0;
    const incomeLimit = parseFloat(eligibility.maxAnnualIncome) || Infinity;

    if (age < minAge || age > maxAge) return null;
    if (eligibility.gender !== 'All' && eligibility.gender !== profile.gender) return null;
    if (income > incomeLimit) return null;
    if (eligibility.state !== 'All' && eligibility.state !== profile.state) return null;

    // Baseline score for meeting hard filters
    score += 30;
    matchReasons.push('Meets basic age, gender, and income requirements');

    // --- 2. Soft Scoring (Relevance) ---

    // Occupation Match (+20)
    const schemeOccupations = eligibility.occupation || [];
    if (schemeOccupations.includes('All')) {
      score += 10;
    } else if (schemeOccupations.some(occ => occ.toLowerCase() === (profile.occupation || '').toLowerCase())) {
      score += 20;
      matchReasons.push(`Highly relevant for ${profile.occupation}s`);
    }

    // Caste Category Match (+15)
    const schemeCastes = eligibility.casteCategory || [];
    if (schemeCastes.includes('All')) {
      score += 5;
    } else if (schemeCastes.includes(profile.casteCategory)) {
      score += 15;
      matchReasons.push(`Specifically benefits ${profile.casteCategory} community`);
    }

    // Family Situation (+15)
    if (profile.isPregnantOrLactating && scheme.tags?.some(t => t.toLowerCase().includes('maternal') || t.toLowerCase().includes('nutrition'))) {
      score += 15;
      matchReasons.push('Tailored for maternal health support');
    }
    if (profile.hasBplCard && (scheme.tags?.some(t => t.toLowerCase().includes('bpl')) || scheme.description?.toLowerCase().includes('bpl'))) {
      score += 15;
      matchReasons.push('Priority benefit for BPL card holders');
    }
    if (profile.hasDisability && (scheme.category === 'Disability' || scheme.tags?.some(t => t.toLowerCase().includes('disability')))) {
      score += 15;
      matchReasons.push('Designed for accessibility and disability support');
    }

    // Modern Access Bonus (+10)
    if (scheme.applicationUrl) {
      score += 10;
      matchReasons.push('Supports fast-track online application');
    }

    // Locale Continuity (+10)
    if (eligibility.state === profile.state && eligibility.state !== 'All') {
      score += 10;
      matchReasons.push(`Dedicated program for ${profile.state}`);
    }

    // Documents Analysis (+10)
    // We assume they have basic docs (Aadhaar), but check for specialized ones
    documents.forEach(doc => {
      const d = doc.toLowerCase();
      let owned = false;
      if (d.includes('aadhaar')) owned = true;
      if (d.includes('bpl') && profile.hasBplCard) owned = true;
      if (d.includes('disability') && profile.hasDisability) owned = true;
      if (d.includes('income') && profile.annualIncome) owned = true;
      
      if (!owned) missingDocs.push(doc);
    });

    if (missingDocs.length === 0) {
      score += 10;
      matchReasons.push('You likely possess all required documents');
    }

    return {
      ...scheme,
      matchScore: Math.min(score, 100),
      matchReasons: [...new Set(matchReasons)],
      missingDocuments: missingDocs
    };
  }).filter(s => s !== null && s.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Generates a personalized step-by-step application guide.
 * 
 * @param {Object} scheme - The specific scheme data.
 * @param {Object} profile - The user's profile data.
 * @returns {Object} - Personalized roadmap metadata.
 */
function generateGuidance(scheme, profile) {
  const isOnline = !!scheme.applicationUrl;
  const steps = [
    {
      title: 'Documentation Preparation',
      action: `Gather your original ${scheme.documents?.slice(0, 3).join(', ')} and photocopies.`
    }
  ];

  if (isOnline) {
    steps.push({
      title: 'Digital Application',
      action: `Use your mobile or a CSC center to apply at ${new URL(scheme.applicationUrl).hostname}.`
    });
  } else {
    steps.push({
      title: 'Office Visit',
      action: `Visit the local ${scheme.ministry?.split(' ')[2] || 'Administrative'} office with your references.`
    });
  }

  steps.push({
    title: 'Verification',
    action: profile.hasBplCard ? 'Present your BPL card for priority processing/verification.' : 'Await local field officer verification.'
  });

  return {
    steps,
    estimatedTime: isOnline ? '5-10 Days' : '15-45 Days',
    nearestOfficeType: scheme.category === 'Agriculture' ? 'Krishi Bhavan' : 'Tehsildar Office',
    tips: [
      'Ensure your bank account is Aadhaar seeded.',
      'Carry two passport-sized photographs.',
      'Verify that names on all documents match exactly.'
    ]
  };
}

module.exports = {
  matchSchemes,
  generateGuidance
};
