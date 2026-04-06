import React, { useState, useRef, useEffect } from 'react';
import EligibilityForm from './components/EligibilityForm';
import SchemesDashboard from './components/SchemesDashboard';
import VoiceAssistant from './components/VoiceAssistant';
import OfflineBanner from './components/OfflineBanner';
import DemoDashboard from './components/DemoDashboard';
import { storage } from './services/db';

const App = () => {
  const [language, setLanguage] = useState('en');
  const [results, setResults] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const formRef = useRef(null);

  // Load offline data on mount
  useEffect(() => {
    const loadOfflineData = async () => {
      try {
        const [cachedProfile, cachedMatches] = await Promise.all([
          storage.getProfile(),
          storage.getMatches()
        ]);

        if (cachedProfile && cachedMatches) {
          setUserProfile(cachedProfile);
          setResults(cachedMatches);
          setIsOfflineMode(!navigator.onLine);
        }
      } catch (err) {
        console.error('Failed to load offline data:', err);
      }
    };

    loadOfflineData();
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleResults = async (schemes, profile) => {
    setResults(schemes);
    setUserProfile(profile);
    setIsOfflineMode(false);

    try {
      await Promise.all([
        storage.saveProfile(profile),
        storage.saveMatches(schemes)
      ]);
    } catch (err) {
      console.warn('Failed to sync offline storage:', err);
    }
  };

  const translations = {
    en: {
      heroTag: 'Discover the benefits you deserve',
      heroSub: 'Every year, ₹2.4 Crore in government benefits goes unclaimed. We help you find yours in minutes.',
      cta: 'Check My Eligibility',
      howTitle: 'How it works',
      step1: 'Fill Details',
      step1Sub: 'Answer a few simple questions about your profile.',
      step2: 'AI Matching',
      step2Sub: 'Our system scans 500+ schemes to find your matches.',
      step3: 'Apply with Ease',
      step3Sub: 'Get step-by-step guidance to claim your entitlements.',
      switchLang: 'தமிழ்',
      dashboardBtn: 'Impact Dashboard',
      backToApp: 'Back to discovery'
    },
    ta: {
      heroTag: 'உங்களுக்குத் தகுதியான நன்மைகளைக் கண்டறியுங்கள்',
      heroSub: 'ஒவ்வொரு ஆண்டும், ₹2.4 கோடி அரசு சலுகைகள் கோரப்படாமல் போகின்றன. உங்களுடையதை நிமிடங்களில் கண்டறிய உதவுகிறோம்.',
      cta: 'எனது தகுதியைச் சரிபார்க்கவும்',
      howTitle: 'இது எப்படி வேலை செய்கிறது',
      step1: 'விவரங்களை நிரப்பவும்',
      step1Sub: 'உங்கள் சுயவிவரத்தைப் பற்றிய சில எளிய கேள்விகளுக்கு பதிலளிக்கவும்.',
      step2: 'AI பொருத்தம்',
      step2Sub: 'உங்கள் பொருத்தங்களைக் கண்டறிய எங்கள் கணினி 500+ திட்டங்களை ஸ்கேன் செய்கிறது.',
      step3: 'எளிதாக விண்ணப்பிக்கவும்',
      step3Sub: 'உங்கள் உரிமைகளைப் பெறுவதற்கான படிப்படியான வழிகாட்டலைப் பெறுங்கள்.',
      switchLang: 'English',
      dashboardBtn: 'தாக்க டாஷ்போர்டு',
      backToApp: 'கண்டுபிடிப்புக்குத் திரும்பு'
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <OfflineBanner />
      
      {/* Navigation */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-blue-900 underline decoration-blue-500 decoration-4 cursor-pointer" onClick={() => setShowDashboard(false)}>MEDCS</span>
              {isOfflineMode && <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded uppercase">Offline</span>}
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => setShowDashboard(!showDashboard)}
                className={`hidden sm:block px-4 py-2 text-xs font-bold rounded-full transition ${showDashboard ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
              >
                {showDashboard ? t.backToApp : t.dashboardBtn}
              </button>
              <button 
                onClick={() => setLanguage(l => l === 'en' ? 'ta' : 'en')}
                className="px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-full transition"
              >
                {t.switchLang}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showDashboard ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
             <div className="mb-10 text-center">
                <h2 className="text-3xl font-black text-slate-900 mb-2">Social Impact Dashboard</h2>
                <p className="text-slate-500 font-medium">Real-time visualization of welfare entitlement detection & citizen empowerment</p>
             </div>
             <DemoDashboard />
          </div>
        ) : (
          <>
            {/* Landing Hero (Only show if no results yet) */}
            {!results && (
              <>
                <section className="relative pt-12 pb-24 overflow-hidden bg-white rounded-3xl mb-8">
                  <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                      <span>2.4 Crore Unclaimed Benefits Yearly</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                      {t.heroTag}
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10 leading-relaxed">
                      {t.heroSub}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button 
                        onClick={scrollToForm}
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl text-lg hover:bg-blue-700 shadow-2xl shadow-blue-200 transform transition hover:-translate-y-1"
                      >
                        {t.cta}
                      </button>
                      <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl text-lg hover:bg-slate-50 transition">
                        Learn More
                      </button>
                    </div>
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30 translate-y-1/2 -translate-x-1/2"></div>
                  </div>
                </section>

                <section className="py-20 mb-8">
                  <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">{t.howTitle}</h2>
                  <div className="grid md:grid-cols-3 gap-12 relative">
                    <div className="hidden md:block absolute top-12 left-1/4 w-1/2 h-0.5 border-t-2 border-dashed border-slate-200 -z-0"></div>
                    {[
                      { step: 1, title: t.step1, sub: t.step1Sub, icon: '📝' },
                      { step: 2, title: t.step2, sub: t.step2Sub, icon: '🤖' },
                      { step: 3, title: t.step3, sub: t.step3Sub, icon: '✅' }
                    ].map((item) => (
                      <div key={item.step} className="text-center relative z-10">
                        <div className="w-20 h-20 bg-white rounded-3xl shadow-lg border border-slate-100 flex items-center justify-center text-3xl mx-auto mb-6 transform transition hover:scale-110">
                          {item.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-slate-900">{item.title}</h3>
                        <p className="text-slate-600 font-medium">{item.sub}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Eligibility Wizard / Dashboard Area */}
            <section ref={formRef} className={`py-8 scroll-mt-20`}>
              {!results ? (
                <div className="bg-white rounded-[40px] shadow-sm border border-slate-100">
                  <EligibilityForm language={language} onResults={handleResults} />
                </div>
              ) : (
                <SchemesDashboard 
                  schemes={results.matched} 
                  userProfile={userProfile} 
                  onBack={() => setResults(null)} 
                />
              )}
            </section>
          </>
        )}
      </main>

      <VoiceAssistant />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 mt-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <span className="text-white font-bold text-2xl tracking-tight">MEDCS</span>
              <p className="text-sm mt-4 max-w-xs leading-relaxed text-slate-500 font-medium">
                Ensuring no citizen misses out on their entitled government benefits through intelligent detection and guided application.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Platform</h4>
              <ul className="space-y-2 text-sm font-medium">
                <li><a href="#" onClick={() => setShowDashboard(true)} className="hover:text-white transition">Impact Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition">Verify Identity</a></li>
                <li><a href="#" className="hover:text-white transition">Partner API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-widest">Trust</h4>
              <ul className="space-y-2 text-sm font-medium">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 text-center sm:text-left sm:flex justify-between items-center">
            <p className="text-xs font-medium text-slate-600">© 2026 MEDCS Portal. All rights reserved.</p>
            <div className="flex space-x-6 justify-center mt-4 sm:mt-0">
              <span className="text-xs font-bold text-slate-300">Hackathon Edition — Build for Bharat</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
