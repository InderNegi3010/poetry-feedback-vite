export default class MeterValidator {
  // Detect the dominant meter pattern from the first few correct lines
  static detectDominantMeter(allAnalysis) {
    if (!allAnalysis || allAnalysis.length === 0) return null;
    
    // Try to find a consistent pattern from the first 2-3 lines
    const patternCounts = {};
    
    for (let i = 0; i < Math.min(3, allAnalysis.length); i++) {
      const line = allAnalysis[i];
      if (line.sections) {
        const pattern = line.sections.map(s => s.weights.join('')).join('-');
        patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
      }
    }
    
    // Find the most common pattern
    let dominantPattern = null;
    let maxCount = 0;
    
    for (const [pattern, count] of Object.entries(patternCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantPattern = pattern;
      }
    }
    
    return dominantPattern;
  }

  // Check if a line matches the expected meter pattern
  static validateLine(lineAnalysis, expectedPattern) {
    if (!lineAnalysis || !lineAnalysis.sections || !expectedPattern) {
      return { isValid: false, errors: [] };
    }
    
    const linePattern = lineAnalysis.sections.map(s => s.weights.join('')).join('-');
    const expectedParts = expectedPattern.split('-');
    const lineParts = linePattern.split('-');
    
    // Check if patterns match
    if (linePattern === expectedPattern) {
      return { isValid: true, errors: [] };
    }
    
    // If not exact match, check for length issues or pattern breaks
    const errors = [];
    const totalExpectedSyllables = expectedParts.reduce((sum, part) => sum + part.length, 0);
    const totalLineSyllables = lineAnalysis.syllables.length;
    
    if (totalLineSyllables < totalExpectedSyllables) {
      errors.push('short');
    } else if (totalLineSyllables > totalExpectedSyllables) {
      errors.push('long');
    } else {
      errors.push('pattern');
    }
    
    return { isValid: false, errors };
  }

  // Mark problematic syllables in a line
  static markErrors(lineAnalysis, expectedPattern) {
    if (!lineAnalysis || !expectedPattern) return lineAnalysis;
    
    const validation = this.validateLine(lineAnalysis, expectedPattern);
    if (validation.isValid) return lineAnalysis;
    
    // Create a copy with error markings
    const errorAnalysis = { ...lineAnalysis };
    errorAnalysis.hasError = true;
    errorAnalysis.errorType = validation.errors[0];
    
    // Mark sections with errors
    errorAnalysis.sections = lineAnalysis.sections.map((section, sectionIndex) => {
      const newSection = { ...section };
      
      // For pattern errors, mark some syllables as errors
      if (validation.errors.includes('pattern') || validation.errors.includes('short')) {
        // Mark the latter part of the line as problematic
        if (sectionIndex >= Math.floor(lineAnalysis.sections.length / 2)) {
          newSection.syllables = section.syllables.map(syl => ({
            text: syl,
            isError: true
          }));
          newSection.weights = section.weights.map(() => 'x');
          newSection.color = 'bg-red-100';
          newSection.name = 'fe';
        } else {
          newSection.syllables = section.syllables.map(syl => ({
            text: syl,
            isError: false
          }));
        }
      }
      
      return newSection;
    });
    
    return errorAnalysis;
  }
}