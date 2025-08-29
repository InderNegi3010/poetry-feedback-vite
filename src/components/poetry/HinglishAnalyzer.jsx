export default class HinglishAnalyzer {
  // Enhanced Hinglish syllable extraction
  static extractHinglishSyllables(text) {
    if (!text || typeof text !== 'string') return [];
    
    // Remove punctuation and extra spaces, convert to lowercase
    const cleanText = text.toLowerCase().replace(/[^\u0900-\u097Fa-z\s]/g, '').trim();
    if (!cleanText) return [];
    
    // Split by spaces to get words
    const words = cleanText.split(/\s+/);
    let allSyllables = [];
    
    for (const word of words) {
      const wordSyllables = this.extractWordSyllables(word);
      allSyllables = allSyllables.concat(wordSyllables);
    }
    
    return allSyllables;
  }
  
  static extractWordSyllables(word) {
    if (!word) return [];
    
    // Handle Devanagari text
    if (/[\u0900-\u097F]/.test(word)) {
      return this.extractDevanagariSyllables(word);
    }
    
    // Handle Hinglish (Roman text)
    const syllables = [];
    let i = 0;
    
    // Common Hindi syllable patterns in Roman script
    const vowels = 'aeiouAEIOU';
    const consonants = 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ';
    
    while (i < word.length) {
      let syllable = '';
      
      // Start with consonant(s)
      while (i < word.length && consonants.includes(word[i])) {
        syllable += word[i];
        i++;
      }
      
      // Add vowel(s)
      while (i < word.length && vowels.includes(word[i])) {
        syllable += word[i];
        i++;
      }
      
      // If no vowel was found but we have consonant, add implicit 'a'
      if (syllable && !vowels.split('').some(v => syllable.includes(v))) {
        syllable += 'a';
      }
      
      if (syllable) {
        syllables.push(syllable);
      }
      
      // Safety check
      if (syllables.length > 20) break;
    }
    
    return syllables.length > 0 ? syllables : [word];
  }
  
  static extractDevanagariSyllables(text) {
    const syllables = [];
    let i = 0;
    
    while (i < text.length) {
      const char = text[i];
      
      if (!/[\u0900-\u097F]/.test(char)) {
        i++;
        continue;
      }
      
      let syllable = char;
      i++;
      
      // Collect dependent vowels (matras)
      while (i < text.length && /[\u093E-\u094F\u0962-\u0963]/.test(text[i])) {
        syllable += text[i];
        i++;
      }
      
      // Handle conjuncts (halant + consonant)
      while (i < text.length && text[i] === '\u094D') {
        syllable += text[i]; // halant
        i++;
        if (i < text.length && /[\u0915-\u0939]/.test(text[i])) {
          syllable += text[i]; // consonant
          i++;
          // More matras after conjunct
          while (i < text.length && /[\u093E-\u094F\u0962-\u0963]/.test(text[i])) {
            syllable += text[i];
            i++;
          }
        }
      }
      
      if (syllable) syllables.push(syllable);
    }
    
    return syllables;
  }

  static getWeight(syllable) {
    if (!syllable) return 1;
    
    // Devanagari weight calculation
    if (/[\u0900-\u097F]/.test(syllable)) {
      const heavyVowels = /[\u0906\u0908\u090A\u090F-\u0914\u093E\u0940\u0942\u0947-\u094C]/;
      if (heavyVowels.test(syllable)) return 2;
      if (syllable.includes('\u094D')) return 2; // conjuncts
      if (/[\u0902\u0903]/.test(syllable)) return 2; // anusvara/visarga
      return 1;
    }
    
    // Hinglish weight calculation
    const syl = syllable.toLowerCase();
    
    // Long vowels are heavy
    if (/aa|ee|ii|oo|uu|ai|au|aw|ay|ey|oy/.test(syl)) return 2;
    
    // Multiple consonants usually indicate heavy syllable
    const consonantCount = (syl.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
    if (consonantCount > 2) return 2;
    
    // Consonant clusters
    if (/ch|sh|th|kh|gh|ph|bh|dh|jh|ng|nk|nt|nd|st|sp/.test(syl)) return 2;
    
    return 1; // default light
  }

  static detectLanguage(text) {
    const devanagariRegex = /[\u0900-\u097F]/;
    const latinRegex = /[a-zA-Z]/;
    
    const hasDevanagari = devanagariRegex.test(text);
    const hasLatin = latinRegex.test(text);
    
    if (hasDevanagari && hasLatin) return 'mixed';
    if (hasDevanagari) return 'devanagari';
    if (hasLatin) return 'hinglish';
    
    return 'unknown';
  }

  // Apply flexible meter pattern for Hinglish
  static applyHinglishMeterPattern(syllables, weights) {
    const sections = [];
    let currentIndex = 0;

    // Common patterns for Hinglish
    const sectionDefinitions = [
      { name: "mafa'ilun", pattern: [1, 2, 1, 2], color: "bg-blue-100" },
      { name: "fai'latun", pattern: [1, 1, 2, 2], color: "bg-pink-100" },
      { name: "mafa'ilun", pattern: [1, 2, 1, 2], color: "bg-green-100" },
      { name: "fe'lun", pattern: [2, 2], color: "bg-yellow-100" }
    ];

    for (const sectionDef of sectionDefinitions) {
      if (currentIndex >= syllables.length) break;

      const sectionSyllables = [];
      const sectionWeights = [];

      for (let i = 0; i < sectionDef.pattern.length && currentIndex < syllables.length; i++) {
        const expectedWeight = sectionDef.pattern[i];
        const actualWeight = weights[currentIndex];
        
        sectionSyllables.push(syllables[currentIndex]);
        
        // Mark as error if weight doesn't match
        if (actualWeight !== expectedWeight) {
          sectionWeights.push("x");
        } else {
          sectionWeights.push(actualWeight.toString());
        }
        
        currentIndex++;
      }

      if (sectionSyllables.length > 0) {
        const hasError = sectionWeights.includes("x");
        sections.push({
          name: sectionDef.name,
          syllables: sectionSyllables,
          weights: sectionWeights,
          color: hasError ? "bg-red-200" : sectionDef.color,
          hasError
        });
      }
    }

    return sections;
  }

  static analyzeHinglishLine(line) {
    if (!line?.trim()) return null;
    
    const syllables = this.extractHinglishSyllables(line);
    const weights = syllables.map(syl => this.getWeight(syl));
    const sections = this.applyHinglishMeterPattern(syllables, weights);
    
    // Check if line has errors
    const hasError = sections.some(section => section.hasError);
    
    return {
      line: line.trim(),
      isInvalid: hasError,
      sections,
      syllables,
      weights,
      totalSyllables: syllables.length,
      totalWeight: weights.reduce((sum, w) => sum + w, 0)
    };
  }
}