'use client';

import { useState, useEffect } from 'react';

const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState({
    authToken: false,
    userData: null,
    pathname: '',
    localStorage: {}
  });

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    const pathname = window.location.pathname;
    
    // Get all localStorage items
    const localStorageItems: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        localStorageItems[key] = localStorage.getItem(key);
      }
    }

    setDebugInfo({
      authToken: !!authToken,
      userData: userData ? JSON.parse(userData) : null,
      pathname,
      localStorage: localStorageItems
    });
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-[10000]">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div>Auth Token: {debugInfo.authToken ? '✅' : '❌'}</div>
      <div>User Data: {debugInfo.userData ? '✅' : '❌'}</div>
      <div>Pathname: {debugInfo.pathname}</div>
      {debugInfo.userData && (
        <div>User: {(debugInfo.userData as any).firstName} {(debugInfo.userData as any).lastName}</div>
      )}
      <details className="mt-2">
        <summary>LocalStorage</summary>
        <pre className="text-[10px] mt-1 overflow-auto max-h-32">
          {JSON.stringify(debugInfo.localStorage, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default DebugInfo;