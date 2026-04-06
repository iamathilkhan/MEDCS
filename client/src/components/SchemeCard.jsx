import React, { useState } from 'react';

const SchemeCard = ({ scheme, onOpenGuide }) => {
  const [showDocs, setShowDocs] = useState(false);

  // Match strength mapping
  const getMatchStrength = (score) => {
    if (score >= 80) return { label: 'High Match', color: 'bg-green-100 text-green-700', bar: 'bg-green-500 w-full' };
    if (score >= 50) return { label: 'Medium Match', color: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-500 w-2/3' };
    return { label: 'Low Match', color: 'bg-gray-100 text-gray-700', bar: 'bg-gray-400 w-1/3' };
  };

  const strength = getMatchStrength(scheme.matchScore || 85);
  const documents = Array.isArray(scheme.documents) ? scheme.documents : 
                   (typeof scheme.documents === 'string' ? JSON.parse(scheme.documents) : 
                   (scheme.eligibility_criteria ? scheme.eligibility_criteria.split(',') : []));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col h-full">
      {/* Top Meta */}
      <div className="flex justify-between items-start mb-4">
        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded tracking-wider">
          {scheme.category}
        </span>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${strength.color}`}>
          {strength.label}
        </span>
      </div>

      {/* Main Info */}
      <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition leading-tight">
        {scheme.name}
      </h3>
      <p className="text-xs text-slate-500 font-medium mb-3">{scheme.ministry}</p>
      
      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
        {scheme.benefits}
      </p>

      {/* Match Reasons */}
      {scheme.matchReasons && scheme.matchReasons.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {scheme.matchReasons.slice(0, 2).map((reason, i) => (
            <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-semibold rounded-full border border-slate-100">
              ✓ {reason}
            </span>
          ))}
        </div>
      )}

      {/* Match Bar */}
      <div className="mb-6 mt-auto">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-tighter">
          <span>Match Confidence</span>
          <span>{scheme.matchScore || 85}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full transition-all duration-1000 ease-out ${strength.bar}`} />
        </div>
      </div>

      {/* Actions & Docs */}
      <div>
        <button 
          onClick={() => setShowDocs(!showDocs)}
          className="flex items-center justify-between w-full py-2 text-xs font-bold text-slate-700 border-t border-slate-50 hover:text-blue-600 transition"
        >
          <span>Required Documents</span>
          <span className={`transform transition-transform ${showDocs ? 'rotate-180' : ''}`}>▼</span>
        </button>
        
        {showDocs && (
          <ul className="py-2 space-y-1 animate-in slide-in-from-top-1 duration-200">
            {documents.map((doc, i) => (
              <li key={i} className="flex items-start text-[11px] text-slate-600">
                <span className="text-blue-500 mr-2">•</span>
                {doc.trim()}
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-50">
          <a 
            href={scheme.applicationUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3 py-2 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 text-center transition shadow-md shadow-blue-100"
          >
            Apply Online
          </a>
          <button 
            onClick={() => onOpenGuide(scheme)}
            className="px-3 py-2 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg hover:bg-slate-50 text-center transition"
          >
            Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default SchemeCard;
