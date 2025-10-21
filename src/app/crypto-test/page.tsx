'use client';

import { useState, useEffect } from 'react';

interface CoinData {
  usd: number;
  usd_24h_change: number;
}

interface CryptoTestData {
  demo: boolean;
  data: { [key: string]: CoinData };
  timestamp?: string;
}

export default function CryptoTestPage() {
  const [cryptoData, setCryptoData] = useState<CryptoTestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState('Initializing...');

  useEffect(() => {
    const testCryptoAPI = async () => {
      try {
        setApiStatus('Fetching crypto data...');
        setLoading(true);
        
        // Test the API endpoint directly
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin&vs_currencies=usd&include_24hr_change=true');
        
        if (!response.ok) {
          if (response.status === 429) {
            setApiStatus('Rate limited - showing demo data');
            setError('API Rate Limited (429) - This is normal with free CoinGecko API');
            setCryptoData({
              demo: true,
              data: {
                bitcoin: { usd: 67500, usd_24h_change: 2.5 },
                ethereum: { usd: 3800, usd_24h_change: -1.2 },
                binancecoin: { usd: 620, usd_24h_change: 0.8 }
              }
            });
          } else {
            throw new Error(`API Error: ${response.status}`);
          }
        } else {
          const data = await response.json();
          setApiStatus('Live data retrieved successfully!');
          setCryptoData({
            demo: false,
            data: data,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setApiStatus('Error occurred');
        console.error('Crypto API Test Error:', err);
      } finally {
        setLoading(false);
      }
    };

    testCryptoAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🚀 Crypto API Test Page
          </h1>
          
          {/* Status */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">API Status:</h2>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              loading ? 'bg-yellow-100 text-yellow-800' :
              error ? 'bg-red-100 text-red-800' :
              'bg-green-100 text-green-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                loading ? 'bg-yellow-500 animate-pulse' :
                error ? 'bg-red-500' :
                'bg-green-500'
              }`}></div>
              {apiStatus}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-red-800 font-semibold">Error Details:</h3>
              <p className="text-red-700 mt-1">{error}</p>
              <p className="text-red-600 text-sm mt-2">
                ℹ️ This is expected behavior when testing frequently. The CoinGecko free API has rate limits.
              </p>
            </div>
          )}

          {/* Data Display */}
          {cryptoData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Crypto Data:</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cryptoData.demo ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                }`}>
                  {cryptoData.demo ? 'DEMO DATA' : 'LIVE DATA'}
                </span>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(cryptoData.data).map(([coinId, coinData]) => (
                  <div key={coinId} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 capitalize mb-2">{coinId}</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-medium">${coinData.usd?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">24h Change:</span>
                        <span className={`font-medium ${
                          coinData.usd_24h_change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {coinData.usd_24h_change >= 0 ? '+' : ''}{coinData.usd_24h_change?.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {cryptoData.timestamp && (
                <p className="text-xs text-gray-500 mt-4">
                  Last updated: {new Date(cryptoData.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-blue-900 font-semibold mb-2">📋 Test Instructions:</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• This page tests the CoinGecko API integration</li>
              <li>• If you see "Rate Limited", wait a few minutes and refresh</li>
              <li>• The main website will show demo data when rate limited</li>
              <li>• Live data updates automatically when API limits reset</li>
            </ul>
          </div>

          {/* Raw Data */}
          {cryptoData && (
            <details className="mt-6">
              <summary className="cursor-pointer text-gray-700 font-medium">View Raw Data</summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(cryptoData, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}