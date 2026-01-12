import { NextRequest, NextResponse } from 'next/server';

// CoinGecko API endpoints
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

async function fetchCryptoData(query: string): Promise<string> {
  try {
    const lowerQuery = query.toLowerCase();

    // Top gainers/losers
    if (lowerQuery.includes('gainer') || lowerQuery.includes('earner') || lowerQuery.includes('gain') || lowerQuery.includes('top')) {
      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
      );
      const data: any[] = await response.json();
      
      // Sort by 24h price change
      const sorted = data.sort((a: any, b: any) => 
        (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
      );
      
      const topGainers = sorted.slice(0, 5);
      
      let result = '🚀 **Top 5 Crypto Gainers (24h)**\n\n';
      topGainers.forEach((coin: any, idx: number) => {
        result += `${idx + 1}. **${coin.name}** (${coin.symbol.toUpperCase()})\n`;
        result += `   💰 Price: $${coin.current_price.toLocaleString()}\n`;
        result += `   📈 24h Change: ${coin.price_change_percentage_24h?.toFixed(2)}%\n`;
        result += `   📊 Market Cap: $${(coin.market_cap / 1e9).toFixed(2)}B\n\n`;
      });
      
      return result;
    }

    // Losers
    if (lowerQuery.includes('loser') || lowerQuery.includes('lose') || lowerQuery.includes('worst')) {
      const response = await fetch(
        `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
      );
      const data: any[] = await response.json();
      
      const sorted = data.sort((a: any, b: any) => 
        (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)
      );
      
      const topLosers = sorted.slice(0, 5);
      
      let result = '📉 **Top 5 Crypto Losers (24h)**\n\n';
      topLosers.forEach((coin: any, idx: number) => {
        result += `${idx + 1}. **${coin.name}** (${coin.symbol.toUpperCase()})\n`;
        result += `   💰 Price: $${coin.current_price.toLocaleString()}\n`;
        result += `   📉 24h Change: ${coin.price_change_percentage_24h?.toFixed(2)}%\n`;
        result += `   📊 Market Cap: $${(coin.market_cap / 1e9).toFixed(2)}B\n\n`;
      });
      
      return result;
    }

    // Trending coins
    if (lowerQuery.includes('trend') || lowerQuery.includes('popular') || lowerQuery.includes('hot')) {
      const response = await fetch(`${COINGECKO_API}/search/trending`);
      const data: any = await response.json();
      
      let result = '🔥 **Trending Cryptocurrencies**\n\n';
      data.coins.slice(0, 7).forEach((item: any, idx: number) => {
        const coin = item.item;
        result += `${idx + 1}. **${coin.name}** (${coin.symbol})\n`;
        result += `   🏆 Market Cap Rank: #${coin.market_cap_rank || 'N/A'}\n`;
        result += `   💎 Score: ${coin.score}\n\n`;
      });
      
      return result;
    }

    // Market overview
    if (lowerQuery.includes('market') || lowerQuery.includes('overview') || lowerQuery.includes('summary')) {
      const response = await fetch(`${COINGECKO_API}/global`);
      const data: any = await response.json();
      const global = data.data;
      
      let result = '🌍 **Global Crypto Market Overview**\n\n';
      result += `💰 Total Market Cap: $${(global.total_market_cap.usd / 1e12).toFixed(2)}T\n`;
      result += `📊 24h Volume: $${(global.total_volume.usd / 1e9).toFixed(2)}B\n`;
      result += `🪙 Active Cryptocurrencies: ${global.active_cryptocurrencies.toLocaleString()}\n`;
      result += `🏦 Markets: ${global.markets.toLocaleString()}\n`;
      result += `📈 BTC Dominance: ${global.market_cap_percentage.btc.toFixed(2)}%\n`;
      result += `📈 ETH Dominance: ${global.market_cap_percentage.eth.toFixed(2)}%\n`;
      
      return result;
    }

    // Default: top cryptocurrencies
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`
    );
    const data: any[] = await response.json();
    
    let result = '📊 **Top 10 Cryptocurrencies by Market Cap**\n\n';
    data.forEach((coin: any, idx: number) => {
      result += `${idx + 1}. **${coin.name}** (${coin.symbol.toUpperCase()})\n`;
      result += `   💰 Price: $${coin.current_price.toLocaleString()}\n`;
      result += `   📈 24h: ${coin.price_change_percentage_24h?.toFixed(2)}%\n`;
      result += `   📊 Market Cap: $${(coin.market_cap / 1e9).toFixed(2)}B\n\n`;
    });
    
    return result;
    
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    return 'Sorry, I had trouble fetching crypto data. Please try again in a moment.';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await fetchCryptoData(message);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}





