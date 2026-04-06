import React, { useState } from 'react';

const EligibilityForm = ({ onResults, language }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'All',
    state: 'All India',
    district: '',
    annualIncome: '',
    hasBplCard: false,
    occupation: '',
    familySize: '',
    hasChildrenInSchool: false,
    isPregnantOrLactating: false,
    hasDisability: false,
    casteCategory: 'General',
    ownsLand: false
  });

  const translations = {
    en: {
      next: 'Next',
      back: 'Back',
      submit: 'Find My Benefits',
      step: 'Step',
      basicTitle: 'Basic Information',
      economicTitle: 'Economic Profile',
      familyTitle: 'Family Details',
      otherTitle: 'Social Status',
      name: 'Full Name',
      age: 'Age',
      gender: 'Gender',
      state: 'State',
      district: 'District',
      income: 'Annual Income (₹)',
      bpl: 'Do you have a BPL card?',
      occupation: 'Occupation',
      familySize: 'Family Size',
      children: 'Children in school?',
      pregnant: 'Pregnant/Lactating?',
      disability: 'Do you have a disability?',
      caste: 'Caste Category',
      land: 'Do you own land?'
    },
    ta: {
      next: 'அடுத்து',
      back: 'பின்னால்',
      submit: 'நன்மைகளைக் கண்டறியவும்',
      step: 'படி',
      basicTitle: 'அடிப்படை தகவல்',
      economicTitle: 'பொருளாதார விவரம்',
      familyTitle: 'குடும்ப விவரங்கள்',
      otherTitle: 'சமூக நிலை',
      name: 'முழு பெயர்',
      age: 'வயது',
      gender: 'பாலினம்',
      state: 'மாநிலம்',
      district: 'மாவட்டம்',
      income: 'ஆண்டு வருமானம் (₹)',
      bpl: 'உங்களிடம் பிபிஎல் கார்டு உள்ளதா?',
      occupation: 'தொழில்',
      familySize: 'குடும்ப அளவு',
      children: 'பள்ளியில் குழந்தைகள்?',
      pregnant: 'கர்ப்பிணி/பாலூட்டும் தாய்?',
      disability: 'உங்களுக்கு ஊனம் உள்ளதா?',
      caste: 'ஜாதி பிரிவு',
      land: 'உங்களுக்கு நிலம் உள்ளதா?'
    }
  };

  const t = translations[language] || translations.en;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      onResults(data, formData);
    } catch (error) {
      console.error('Error matching schemes:', error);
      alert('Unable to connect to service. Please try again.');
    }
  };

  const progress = (step / 4) * 100;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-blue-50 overflow-hidden">
      {/* Progress Bar */}
      <div className="h-2 bg-blue-100">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="mb-6">
          <span className="text-blue-600 font-bold uppercase text-xs tracking-wider">
            {t.step} {step} of 4
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-1">
            {step === 1 && t.basicTitle}
            {step === 2 && t.economicTitle}
            {step === 3 && t.familyTitle}
            {step === 4 && t.otherTitle}
          </h2>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t.name}</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t.age}</label>
                <input 
                  type="number" name="age" value={formData.age} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t.gender}</label>
                <select 
                  name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  <option value="All">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t.state}</label>
                <input 
                  type="text" name="state" value={formData.state} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t.district}</label>
                <input 
                  type="text" name="district" value={formData.district} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Economic Info */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t.income}</label>
              <input 
                type="number" name="annualIncome" value={formData.annualIncome} onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t.occupation}</label>
              <select 
                name="occupation" value={formData.occupation} onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">Select Occupation</option>
                <option value="Farmer">Farmer</option>
                <option value="Unorganized Worker">Unorganized Worker</option>
                <option value="Street Vendor">Street Vendor</option>
                <option value="Student">Student</option>
                <option value="Self Employed">Self Employed</option>
              </select>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <input 
                type="checkbox" name="hasBplCard" checked={formData.hasBplCard} onChange={handleChange}
                className="h-5 w-5 text-blue-600 rounded"
              />
              <label className="text-sm font-medium text-gray-700">{t.bpl}</label>
            </div>
          </div>
        )}

        {/* Step 3: Family Info */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t.familySize}</label>
              <input 
                type="number" name="familySize" value={formData.familySize} onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <input 
                  type="checkbox" name="hasChildrenInSchool" checked={formData.hasChildrenInSchool} onChange={handleChange}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">{t.children}</label>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <input 
                  type="checkbox" name="isPregnantOrLactating" checked={formData.isPregnantOrLactating} onChange={handleChange}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">{t.pregnant}</label>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Social Status */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t.caste}</label>
              <select 
                name="casteCategory" value={formData.casteCategory} onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <input 
                  type="checkbox" name="hasDisability" checked={formData.hasDisability} onChange={handleChange}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">{t.disability}</label>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <input 
                  type="checkbox" name="ownsLand" checked={formData.ownsLand} onChange={handleChange}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <label className="text-sm font-medium text-gray-700">{t.land}</label>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between gap-4">
          {step > 1 && (
            <button 
              type="button" onClick={() => setStep(s => s - 1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition"
            >
              {t.back}
            </button>
          )}
          {step < 4 ? (
            <button 
              type="button" onClick={() => setStep(s => s + 1)}
              className="flex-[2] px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
            >
              {t.next}
            </button>
          ) : (
            <button 
              type="submit"
              className="flex-[2] px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 transition"
            >
              {t.submit}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EligibilityForm;
