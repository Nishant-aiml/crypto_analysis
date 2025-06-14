
import { genericFetchCoinGecko as originalGenericFetch, fetchCoinPrices as originalFetchCoinPrices, fetchTopCoinsForPortfolio as originalFetchTopCoins } from './coingeckoService';

export const genericFetchCoinGecko = async (url: string, errorMessagePrefix: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorText = `${errorMessagePrefix}, status: ${response.status}`;
      if (response.status === 429) {
        errorText = `API rate limit (429) for ${errorMessagePrefix}. Please try again later.`;
      } else {
        try {
          const errorData = await response.json();
          errorText += ` - Details: ${JSON.stringify(errorData).substring(0, 100)}`;
        } catch (e) {
          try {
            const textData = await response.text();
            errorText += ` - Response: ${textData.substring(0, 100) || '(empty body)'}`;
          } catch (textE) {
            errorText += ` (${response.statusText || 'Failed to parse error response body'})`;
          }
        }
      }
      console.error(`Error in genericFetchCoinGecko for ${url}: ${errorText}`);
      throw new Error(errorText);
    }
    return response.json();
  } catch (error) {
    console.error(`Network or other error in genericFetchCoinGecko for ${url}:`, error);
    if (error instanceof Error && error.message.includes(errorMessagePrefix.split(" (")[0])) { // if already custom error
        throw error;
    }
    throw new Error(`Network error during ${errorMessagePrefix}: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const fetchCoinPrices = async (coinIds: string[]) => {
  if (coinIds.length === 0) return {};
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_7d_change=true`;
  const prices = await genericFetchCoinGecko(url, "fetching portfolio coin prices");
  console.log('Fetched portfolio prices:', prices);
  return prices;
};

export const fetchTopCoinsForPortfolio = async () => {
  const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1';
  return genericFetchCoinGecko(url, "fetching top coins for portfolio");
};

export const fetchGlobalData = async () => {
  const url = 'https://api.coingecko.com/api/v3/global';
  return genericFetchCoinGecko(url, "fetching global market data");
};

export const fetchAdvancedMarketData = async () => {
  const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d';
  return genericFetchCoinGecko(url, "fetching advanced market data");
};

export const fetchTrendingCoins = async () => {
  const url = 'https://api.coingecko.com/api/v3/search/trending';
  return genericFetchCoinGecko(url, "fetching trending coins");
};

export const fetchExchanges = async () => {
  const url = 'https://api.coingecko.com/api/v3/exchanges?per_page=10';
  return genericFetchCoinGecko(url, "fetching exchanges");
};

export const fetchCoinDetails = async (coinId: string) => {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=true&developer_data=true&sparkline=false`;
  return genericFetchCoinGecko(url, `fetching details for ${coinId}`);
};

export const fetchCoinTickers = async (coinId: string) => {
  const url = `https://api.coingecko.com/api/v3/coins/${coinId}/tickers?page=1&order=volume_desc&depth=true`;
  return genericFetchCoinGecko(url, `fetching tickers for ${coinId}`);
};

export const fetchTopCoinsForDominance = async () => {
  const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1';
  return genericFetchCoinGecko(url, "fetching top coins for dominance");
};
