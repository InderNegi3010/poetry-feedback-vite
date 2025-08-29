import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AnalysisGrid from "../components/poetry/AnalysisGrid";
import Sidebar from "../components/poetry/Sidebar";
import HindiAnalyzer from "../components/poetry/HindiAnalyzer";

export default function PoetryChecker() {
  const [poetry, setPoetry] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isHindiOnly, setIsHindiOnly] = useState(false);

  const handleAnalyze = async () => {
    if (!poetry.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysis(null);
    setHasErrors(false);
    setErrorMessage("");
    setIsHindiOnly(false);
    
    // Add realistic delay for user feedback
    await new Promise(r => setTimeout(r, 600));
    
    // Check if input contains English letters or numbers
    if (HindiAnalyzer.hasEnglishOrNumbers(poetry)) {
      setHasErrors(true);
      setErrorMessage("The system could not match the Behr in the highlighted lines");
      setIsAnalyzing(false);
      return;
    }
    
    // Input is Hindi only
    setIsHindiOnly(true);
    
    const lines = poetry.split('\n').filter(l => l.trim());
    const results = lines.map(line => HindiAnalyzer.analyzeLine(line)).filter(Boolean);
    
    setAnalysis(results);
    setIsAnalyzing(false);
  };

  const handleClear = () => {
    setPoetry("");
    setAnalysis(null);
    setHasErrors(false);
    setErrorMessage("");
    setIsHindiOnly(false);
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
              {/* Success message for Hindi only */}
              {isHindiOnly && !hasErrors && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-6">
                  <div className="flex items-center">
                    <span className="font-semibold">Great! Your poetry is in Bahr. Keep up the good work!</span>
                  </div>
                </div>
              )}
              
              {/* Error message */}
              {hasErrors && errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-6">
                  <span className="font-semibold">{errorMessage}</span>
                </div>
              )}
              
              {/* Analysis grid only for Hindi */}
              {isHindiOnly && !hasErrors && (
                <AnalysisGrid 
                  analysis={analysis} 
                  hasErrors={hasErrors}
                />
              )}
              
              {/* Footer only for Hindi and no errors */}
              {isHindiOnly && !hasErrors && (
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