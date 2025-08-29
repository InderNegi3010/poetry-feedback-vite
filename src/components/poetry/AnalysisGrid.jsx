import React from 'react';
import { motion } from 'framer-motion';

export default function AnalysisGrid({ analysis, language, hasErrors, errorMessage }) {
  if (!analysis || analysis.length === 0) return null;

  return (
    <div className="space-y-8 mt-8">
      {analysis.map((lineData, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="space-y-4"
        >
          {/* Line Text - Red if error */}
          <div className="text-center">
            <p className={`text-lg mb-4 ${lineData.hasError ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
              {lineData.line}
            </p>
          </div>
          
          {/* Analysis Table */}
          <div className="flex justify-center">
            <table className="border-collapse border border-gray-300 bg-white">
              <tbody>
                {/* Syllables Row */}
                <tr>
                  {lineData.sections.map((section, sectionIdx) => (
                    <React.Fragment key={`syllables-${sectionIdx}`}>
                      {section.syllables.map((syllable, syllableIdx) => {
                        const isError = typeof syllable === 'object' && syllable.isError;
                        const syllableText = typeof syllable === 'object' ? syllable.text : syllable;
                        const cellColor = isError ? 'bg-red-100' : section.color;
                        
                        return (
                          <td
                            key={`syl-${sectionIdx}-${syllableIdx}`}
                            className={`border border-gray-300 px-3 py-2 text-center font-medium ${cellColor} min-w-[50px]`}
                          >
                            {syllableText}
                          </td>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tr>
                
                {/* Weights Row */}
                <tr>
                  {lineData.sections.map((section, sectionIdx) => (
                    <React.Fragment key={`weights-${sectionIdx}`}>
                      {section.weights.map((weight, weightIdx) => {
                        const isError = weight === 'x';
                        const cellColor = isError ? 'bg-red-100' : section.color;
                        
                        return (
                          <td
                            key={`weight-${sectionIdx}-${weightIdx}`}
                            className={`border border-gray-300 px-3 py-2 text-center font-bold ${cellColor} ${isError ? 'text-red-600' : ''}`}
                          >
                            {weight}
                          </td>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tr>
                
                {/* Pattern Names Row */}
                <tr>
                  {lineData.sections.map((section, sectionIdx) => {
                    const hasErrorInSection = section.syllables.some(s => 
                      (typeof s === 'object' && s.isError) || section.weights.includes('x')
                    );
                    const cellColor = hasErrorInSection ? 'bg-red-100' : section.color;
                    
                    return (
                      <td
                        key={`pattern-${sectionIdx}`}
                        colSpan={section.syllables.length}
                        className={`border border-gray-300 px-3 py-2 text-center font-semibold text-sm ${cellColor}`}
                      >
                        {section.name}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      ))}
      
      {/* Error Message */}
      {hasErrors && errorMessage && (
        <div className="text-center text-red-600 font-medium text-sm mt-4">
          {errorMessage}
        </div>
      )}
    </div>
  );
}