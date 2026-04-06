import React, { useState, useMemo } from 'react';
import SchemeCard from './SchemeCard';
import GuideModal from './GuideModal';

const SchemesDashboard = ({ schemes, userProfile, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeGuide, setActiveGuide] = useState(null);

  // Derive unique categories from matched schemes
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(schemes.map(s => s.category))];
    return cats;
  }, [schemes]);

  // Filter schemes based on selection
  const filteredSchemes = useMemo(() => {
    if (selectedCategory === 'All') return schemes;
    return schemes.filter(s => s.category === selectedCategory);
  }, [schemes, selectedCategory]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Dashboard Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome, <span className="text-blue-600">{userProfile.name || 'Citizen'}</span>
          </h2>
          <p className="text-slate-500 font-medium">
            Based on your profile, you are eligible for <span className="text-slate-900 font-bold">{schemes.length} schemes</span>.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Profile Strength</p>
            <p className="text-sm font-bold text-green-600">Verified ✅</p>
          </div>
          <button 
            onClick={onBack}
            className="px-6 py-3 border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-50 transition flex items-center"
          >
            <span className="mr-2">↺</span> Edit Profile
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      {filteredSchemes.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map(scheme => (
            <SchemeCard 
              key={scheme.id} 
              scheme={scheme} 
              onOpenGuide={(s) => setActiveGuide(s)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-500 font-medium">No matches found in the "{selectedCategory}" category.</p>
          <button 
            onClick={() => setSelectedCategory('All')}
            className="mt-4 text-blue-600 font-bold hover:underline"
          >
            View all categories
          </button>
        </div>
      )}

      {/* Guide Modal Overlay */}
      {activeGuide && (
        <GuideModal 
          scheme={activeGuide} 
          onClose={() => setActiveGuide(null)} 
        />
      )}

      {/* Trust Banner */}
      <div className="bg-blue-900 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Need Expert Help?</h3>
            <p className="text-blue-200 text-sm max-w-md">Our certified facilitators can help you with door-step document collection and application filing for a small fee.</p>
          </div>
          <button className="px-8 py-4 bg-white text-blue-900 font-bold rounded-2xl hover:bg-blue-50 transition whitespace-nowrap">
            Book a Facilitator
          </button>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800 rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
};

export default SchemesDashboard;
