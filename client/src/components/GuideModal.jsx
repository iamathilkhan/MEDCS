import React, { useState } from 'react';

const GuideModal = ({ scheme, onClose }) => {
  const documents = Array.isArray(scheme.documents) ? scheme.documents : 
                   (typeof scheme.documents === 'string' ? JSON.parse(scheme.documents) : 
                   (scheme.eligibility_criteria ? scheme.eligibility_criteria.split(',') : []));
  
  const [checkedDocs, setCheckedDocs] = useState({});

  const toggleDoc = (doc) => {
    setCheckedDocs(prev => ({ ...prev, [doc]: !prev[doc] }));
  };

  // Use guidance from the server-side engine
  const guidance = scheme.guidance || {
    steps: [
      { title: 'Prepare Documentation', action: 'Ensure you have all the original documents and photocopies ready.' },
      { title: 'Application Process', action: 'Submit your application at the nearest Common Service Centre (CSC).' }
    ],
    estimatedTime: '2-4 Weeks',
    nearestOfficeType: 'CSC Portal',
    tips: ['Carry two passport-sized photographs.', 'Ensure your Aadhaar is linked to your mobile number.']
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white">
          <div>
            <h2 className="text-xl font-bold">Personalized Guide</h2>
            <p className="text-blue-100 text-xs font-medium">{scheme.name}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Timeline / Time Status */}
          <div className="mb-8 flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Estimated Processing</p>
              <p className="text-sm font-bold text-slate-900">{guidance.estimatedTime}</p>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Success Probability</p>
              <p className="text-sm font-bold text-green-600">High ⭐</p>
            </div>
          </div>

          {/* Document Checklist */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 text-[10px]">1</span>
              Document Checklist
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {documents.map((doc, i) => (
                <label 
                  key={i} 
                  className={`flex items-center p-3 rounded-xl border transition cursor-pointer ${checkedDocs[doc] ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-blue-200'}`}
                >
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={!!checkedDocs[doc]} 
                    onChange={() => toggleDoc(doc)} 
                  />
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 ${checkedDocs[doc] ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300'}`}>
                    {checkedDocs[doc] && '✓'}
                  </div>
                  <span className="text-xs font-medium">{doc.trim()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 text-[10px]">2</span>
              Step-by-Step Roadmap
            </h3>
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {(guidance.steps || []).map((step, i) => (
                <div key={i} className="relative pl-10">
                  <div className="absolute left-0 w-8 h-8 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                    {i + 1}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{step.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Office Finder Placeholder from Engine */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 text-[10px]">3</span>
              Where to Submit
            </h3>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-red-500 text-3xl">
                📍
              </div>
              <div className="text-center sm:text-left flex-1">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter">Recommended Facilitation Hub</p>
                <p className="text-sm font-bold text-slate-900">{guidance.nearestOfficeType} — District Main</p>
                <p className="text-[10px] text-slate-500 mt-1">Government Office Complex, Main Road, Block 4-C</p>
              </div>
              <button className="px-4 py-2 bg-white text-blue-600 text-[10px] font-bold rounded-lg border border-slate-200 hover:border-blue-400 transition">
                Show Map
              </button>
            </div>
          </div>

          {/* Tips from Engine */}
          <div>
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Pro Tips</h3>
             <ul className="space-y-2">
                {guidance.tips.map((tip, i) => (
                   <li key={i} className="flex items-center text-[11px] text-orange-700 bg-orange-50 border border-orange-100 px-3 py-2 rounded-lg">
                      <span className="mr-2 italic">📌</span> {tip}
                   </li>
                ))}
             </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition"
          >
            Start Applying
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
