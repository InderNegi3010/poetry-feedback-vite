import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AnalysisGrid from "../components/poetry/AnalysisGrid";
import Sidebar from "../components/poetry/Sidebar";
import HindiAnalyzer from "../components/poetry/HindiAnalyzer";
import HinglishAnalyzer from "../components/poetry/HinglishAnalyzer";

export default function PoetryChecker() {
  const [poetry, setPoetry] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [hasInvalidLines, setHasInvalidLines] = useState(false);

  const handleAnalyze = async () => {
    if (!poetry.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysis(null);
    setHasInvalidLines(false);
    setDetectedLanguage(null);
    
    // Add realistic delay for user feedback
    await new Promise(r => setTimeout(r, 600));
    
    // Detect language type
    const language = HinglishAnalyzer.detectLanguage(poetry);
    setDetectedLanguage(language);
    
    const lines = poetry.split('\n').filter(l => l.trim());
    let results = [];
    let hasInvalid = false;
    
    if (language === 'devanagari') {
      // Pure Hindi analysis
      results = lines.map(line => {
        const result = HindiAnalyzer.analyzeLine(line);
        if (result && result.isInvalid) {
          hasInvalid = true;
        }
        return result;
      }).filter(Boolean);
    } else if (language === 'hinglish') {
      // Hinglish analysis
      results = lines.map(line => {
        const result = HinglishAnalyzer.analyzeHinglishLine(line);
        if (result && result.isInvalid) {
          hasInvalid = true;
        }
        return result;
      }).filter(Boolean);
    } else {
      // Mixed or invalid - mark all lines as invalid
      results = lines.map(line => ({
        line: line.trim(),
        isInvalid: true,
        sections: [],
        syllables: []
      }));
      hasInvalid = true;
    }
    
    setHasInvalidLines(hasInvalid);
    setAnalysis(results);
    setIsAnalyzing(false);
  };

  const handleClear = () => {
    setPoetry("");
    setAnalysis(null);
    setHasInvalidLines(false);
    setDetectedLanguage(null);
  };

  // Check if we should show success message (no invalid lines)
  const showSuccessMessage = analysis && !hasInvalidLines && detectedLanguage;
  
  // Check if we should show footer (Hindi only, no invalid lines)
  const showFooter = analysis && !hasInvalidLines && detectedLanguage === 'devanagari';

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
              className="px-8 py-2 bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "CHECK BAHR"
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
              className="mt-8"
            >
              {/* Error message for invalid lines */}
              {hasInvalidLines && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">The system could not match the Behr in the highlighted lines</span>
                </div>
              )}
              
              {/* Success message for valid poetry */}
              {showSuccessMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-6">
                  <div className="flex items-center">
                    <span className="font-semibold">Great! Your poetry is in Bahr. Keep up the good work!</span>
                  </div>
                </div>
              )}
              
              {/* Meter section names header (only for valid Hindi) */}
              {detectedLanguage === 'devanagari' && !hasInvalidLines && (
                <div className="text-center mb-6">
                  <div className="text-base font-semibold text-gray-800 mb-2">
                    मुज्तस मुसम्मन मख़बून महज़ूफ़ मस्कन
                  </div>
                  <div className="text-base font-semibold text-gray-600">
                    मुफ़ाइलुन फ़इलातुन मुफ़ाइलुन फ़ेलुन
                  </div>
                </div>
              )}
              
              {/* Analysis grid */}
              <AnalysisGrid 
                analysis={analysis} 
                detectedLanguage={detectedLanguage}
                hasInvalidLines={hasInvalidLines}
              />
              
              {/* Footer (Hindi only, no errors) */}
              {showFooter && (
                <div className="bg-white border border-gray-300 p-6 text-center space-y-4 mt-8">
                  <h4 className="font-bold text-gray-800 text-base">
                    आप की रचना निम्नलिखित बहर में है:
                  </h4>
                  <div className="space-y-2">
                    <div className="text-base font-semibold">
                      मुज्तस मुसम्मन मख़बून महज़ूफ़ मस्कन
                    </div>
                    <div className="text-base font-semibold">
                      मुफ़ाइलुन फ़इलातुन मुफ़ाइलुन फ़ेलुन
                    </div>
                    <div className="flex justify-center space-x-4 mt-4">
                      {["1212", "1122", "1212", "22"].map((pattern, i) => (
                        <div key={i} className="bg-gray-100 border border-gray-300 px-4 py-2">
                          <div className="font-mono text-sm">{pattern}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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