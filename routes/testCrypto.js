const express = require('express');
const router = express.Router();

// Test endpoint to check crypto prices
router.get('/test-crypto', async (req, res) => {
  try {
    console.log('🔍 Testing crypto API...');
    
    // Test CoinGecko API directly
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,ripple,tether,solana&vs_currencies=usd&include_24hr_change=true'
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Crypto API Response:', data);
    
    // Format the data for display
    const formattedData = Object.entries(data).map(([coinId, coinData]) => ({
      id: coinId,
      price: coinData.usd,
      change: coinData.usd_24h_change,
      formatted_price: `$${coinData.usd.toLocaleString()}`,
      formatted_change: `${coinData.usd_24h_change >= 0 ? '+' : ''}${coinData.usd_24h_change.toFixed(2)}%`
    }));
    
    res.json({
      success: true,
      message: 'Crypto prices fetched successfully',
      data: formattedData,
      raw_response: data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error testing crypto API:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint for market data
router.get('/test-market', async (req, res) => {
  try {
    console.log('🔍 Testing market data API...');
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&locale=en'
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Market API Response (first 3 coins):', data.slice(0, 3));
    
    const formattedData = data.map((coin, index) => ({
      rank: index + 1,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: `$${coin.current_price.toLocaleString()}`,
      change_24h: `${coin.price_change_percentage_24h >= 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}%`,
      market_cap: `$${(coin.market_cap / 1e9).toFixed(1)}B`,
      volume: `$${(coin.total_volume / 1e9).toFixed(1)}B`
    }));
    
    res.json({
      success: true,
      message: 'Market data fetched successfully',
      count: data.length,
      data: formattedData,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error testing market API:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// New trending endpoint
router.get('/test-trending', async (req, res) => {
  try {
    console.log('🔥 Testing trending crypto API...');
    
    const response = await fetch('https://api.coingecko.com/api/v3/search/trending');

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔥 Trending API Response:', data);

    const trendingCoins = data.coins.slice(0, 10).map((item, index) => ({
      rank: index + 1,
      name: item.item.name,
      symbol: item.item.symbol,
      market_cap_rank: item.item.market_cap_rank,
      price_btc: item.item.price_btc,
      score: item.item.score
    }));

    res.json({
      success: true,
      message: 'Trending crypto data fetched successfully',
      timestamp: new Date().toISOString(),
      trending_coins: trendingCoins,
      features: [
        'Top 10 Trending Coins',
        'Real-time Trend Scores',
        'Market Cap Rankings',
        'BTC Price Ratios'
      ]
    });

  } catch (error) {
    console.error('❌ Error in trending endpoint:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;