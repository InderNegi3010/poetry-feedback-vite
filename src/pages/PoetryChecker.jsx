import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AnalysisGrid from "../components/poetry/AnalysisGrid";
import SuccessMessage from "../components/poetry/SuccessMessage";
import MeterSummary from "../components/poetry/MeterSummary";
import Sidebar from "../components/poetry/Sidebar";
import HinglishAnalyzer from "../components/poetry/HinglishAnalyzer";
import MeterPatterns from "../components/poetry/MeterPatterns.jsx";
import MeterValidator from "../components/poetry/MeterValidator";

export default function PoetryChecker() {
  const [poetry, setPoetry] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [hasErrors, setHasErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const analyzeLine = (line, language) => {
    if (!line.trim()) return null;
    
    let syllables, weights;

    if (language === 'devanagari' || language === 'mixed') {
      // Use Devanagari analysis
      const devanagariSyllables = HinglishAnalyzer.extractDevanagariSyllables(line);
      syllables = devanagariSyllables;
      weights = syllables.map(syl => HinglishAnalyzer.getWeight(syl));
    } else {
      // Use Hinglish analysis  
      const hinglishResult = HinglishAnalyzer.analyzeHinglishLine(line);
      if (!hinglishResult) return null;
      syllables = hinglishResult.syllables;
      weights = hinglishResult.weights;
    }
    
    if (!syllables || syllables.length === 0) return null;

    // Create sections using the improved meter patterns with language-specific names
    const sections = MeterPatterns.createSections(syllables, weights, language);

    return {
      line: line.trim(),
      sections,
      syllables,
      weights
    };
  };

  const handleAnalyze = async () => {
    if (!poetry.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysis(null);
    setDetectedLanguage(null);
    setHasErrors(false);
    setErrorMessage("");
    
    // Add realistic delay for user feedback
    await new Promise(r => setTimeout(r, 600));
    
    // Detect language from the first line
    const firstLine = poetry.split('\n').find(l => l.trim());
    const language = HinglishAnalyzer.detectLanguage(firstLine || poetry);
    setDetectedLanguage(language);
    
    const lines = poetry.split('\n').filter(l => l.trim());
    const results = lines.map(line => analyzeLine(line, language)).filter(Boolean);
    
    // Detect dominant meter pattern from the first few lines
    const dominantPattern = MeterValidator.detectDominantMeter(results);
    
    // Simple quality analysis like Rekhta
    const qualityAnalysis = MeterValidator.analyzePoetryQuality(results, dominantPattern);
    
    // Validate each line against the dominant pattern
    const validatedResults = results.map(lineResult => {
      const validation = MeterValidator.validateLine(lineResult, dominantPattern);
      
      if (!validation.isValid) {
        return MeterValidator.markErrors(lineResult, dominantPattern);
      }
      
      return lineResult;
    });
    
    // Set states based on analysis results (simple like Rekhta)
    setHasErrors(qualityAnalysis.hasErrors);
    
    // Generate error message only if there are errors
    if (qualityAnalysis.hasErrors) {
      const errorMsg = MeterValidator.getErrorMessage(validatedResults, language);
      setErrorMessage(errorMsg);
    }
    
    setAnalysis(validatedResults);
    setIsAnalyzing(false);
  };

  const handleClear = () => {
    setPoetry("");
    setAnalysis(null);
    setDetectedLanguage(null);
    setHasErrors(false);
    setErrorMessage("");
  };

  return (
    <div className="grid lg:grid-cols-[1fr_auto] gap-8">
      <div className="flex-grow">
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <Textarea
            className="w-full h-40 p-4 border-gray-300 rounded-md text-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="यहाँ अपनी कविता लिखें..."
            value={poetry}
            onChange={(e) => setPoetry(e.target.value)}
          />
          <div className="flex gap-3 mt-4">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !poetry.trim()}
              className="px-8 py-2 bg-red-600 text-white font-semibold hover:bg-red-700 disabled:bg-gray-400"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Check Bahr"
              )}
            </Button>
            
            {(poetry || analysis) && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="px-6 py-2"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Success message only shows when NO errors (like Rekhta) */}
              <SuccessMessage 
                language={detectedLanguage} 
                hasErrors={hasErrors}
              />
              
              {/* Analysis grid with error highlighting */}
              <AnalysisGrid 
                analysis={analysis} 
                language={detectedLanguage} 
                hasErrors={hasErrors}
                errorMessage={errorMessage}
              />
              
              {/* Meter summary only when no errors */}
              <MeterSummary 
                sections={analysis.map(a => a.sections)} 
                language={detectedLanguage}
                hasErrors={hasErrors}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="hidden lg:block">
        <Sidebar />
      </div>
    </div>
  );
}