import React, { useState, useEffect, useRef } from 'react';

const VoiceAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [isSupported, setIsSupported] = useState(true);
  const [chat, setChat] = useState([]);
  
  const recognitionRef = useRef(null);

  const languages = [
    { name: 'English', code: 'en-IN', apiCode: 'en' },
    { name: 'தமிழ்', code: 'ta-IN', apiCode: 'ta' },
    { name: 'हिन्दी', code: 'hi-IN', apiCode: 'hi' },
    { name: 'తెలుగు', code: 'te-IN', apiCode: 'te' },
    { name: 'ಕನ್ನಡ', code: 'kn-IN', apiCode: 'kn' }
  ];

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      handleVoiceQuery(text);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    setResponse('');
    recognitionRef.current.lang = selectedLang;
    recognitionRef.current.start();
    setIsListening(true);
  };

  const handleVoiceQuery = async (text) => {
    const langObj = languages.find(l => l.code === selectedLang);
    const apiLang = langObj ? langObj.apiCode : 'en';

    setChat(prev => [...prev, { type: 'user', text }]);

    try {
      const res = await fetch('http://localhost:5000/api/voice-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: apiLang })
      });
      const data = await res.json();
      setResponse(data.reply);
      setChat(prev => [...prev, { type: 'ai', text: data.reply }]);
      speak(data.reply);
    } catch (error) {
      console.error('Voice query failed', error);
    }
  };

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 right-6 z-[100]">
        <div className="bg-white p-4 rounded-xl shadow-lg border border-red-100 text-xs text-red-600 font-bold">
          Voice recognition not supported in this browser.
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {/* Chat Panel */}
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
            <h3 className="font-bold text-sm">Voice Assistant</h3>
            <select 
              value={selectedLang} 
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-blue-700 text-[10px] font-bold rounded px-2 py-1 outline-none border-none"
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="h-64 overflow-y-auto p-4 space-y-4 bg-slate-50 flex flex-col">
            {chat.length === 0 && (
              <div className="flex-1 flex flex-center items-center justify-center text-center p-6">
                <p className="text-xs text-slate-400 font-medium italic">
                  Tap the mic and speak to find schemes. Try saying "Farmer" or "Health".
                </p>
              </div>
            )}
            {chat.map((msg, i) => (
              <div key={i} className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${msg.type === 'user' ? 'bg-blue-600 text-white self-end rounded-tr-none' : 'bg-white text-slate-700 self-start rounded-tl-none border border-slate-200 shadow-sm'}`}>
                {msg.text}
              </div>
            ))}
            {isListening && (
              <div className="self-start bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex justify-center">
            <button 
              onClick={isListening ? () => {} : startListening}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-100 text-red-500 scale-110' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
            >
              {isListening ? (
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-12 h-12 bg-red-400 rounded-full animate-ping opacity-20"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 group relative"
      >
        {isOpen ? (
          <span className="text-2xl font-bold">✕</span>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-white animate-pulse"></span>
          </>
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;
