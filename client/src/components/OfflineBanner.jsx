import React, { useState, useEffect } from 'react';

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-[100] animate-in slide-in-from-top duration-300">
      <div className="bg-yellow-400 text-yellow-900 px-4 py-3 flex items-center justify-center space-x-2 shadow-lg border-b border-yellow-500">
        <span className="text-xl">⚠️</span>
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
          <p className="text-sm font-extrabold uppercase tracking-tight">You're currently offline.</p>
          <p className="text-xs font-medium">Your last matched schemes are still available for browsing.</p>
        </div>
      </div>
    </div>
  );
};

export default OfflineBanner;
