import type { InvestmentType } from './types';

export type MarketAsset = { type: InvestmentType; symbol: string; name: string; market: 'stocks' | 'crypto'; category: string; basePrice: number; volatility: number; circulatingSupply: number; volumeRate: number; description: string };

export const MARKET_ASSETS: MarketAsset[] = [
  { type: 'stock-apple', symbol: 'AAPL', name: 'Apple', market: 'stocks', category: 'Technology', basePrice: 352, volatility: 0.16, circulatingSupply: 15000000000, volumeRate: 0.035, description: 'Consumer technology, devices and services.' },
  { type: 'stock-microsoft', symbol: 'MSFT', name: 'Microsoft', market: 'stocks', category: 'Technology', basePrice: 508, volatility: 0.14, circulatingSupply: 7430000000, volumeRate: 0.028, description: 'Software, cloud and productivity platforms.' },
  { type: 'stock-nvidia', symbol: 'NVDA', name: 'Nvidia', market: 'stocks', category: 'Semiconductors', basePrice: 151, volatility: 0.25, circulatingSupply: 24400000000, volumeRate: 0.055, description: 'Accelerated computing and AI infrastructure.' },
  { type: 'stock-alphabet', symbol: 'GOOGL', name: 'Alphabet', market: 'stocks', category: 'Technology', basePrice: 281, volatility: 0.17, circulatingSupply: 12200000000, volumeRate: 0.03, description: 'Internet services, advertising and cloud.' },
  { type: 'stock-amazon', symbol: 'AMZN', name: 'Amazon', market: 'stocks', category: 'Consumer', basePrice: 267, volatility: 0.19, circulatingSupply: 10600000000, volumeRate: 0.04, description: 'E-commerce, logistics and cloud services.' },
  { type: 'stock-tesla', symbol: 'TSLA', name: 'Tesla', market: 'stocks', category: 'Automotive', basePrice: 338, volatility: 0.32, circulatingSupply: 3200000000, volumeRate: 0.075, description: 'Electric vehicles, energy and automation.' },
  { type: 'stock-samsung', symbol: '005930.KS', name: 'Samsung Electronics', market: 'stocks', category: 'Semiconductors', basePrice: 64, volatility: 0.2, circulatingSupply: 5960000000, volumeRate: 0.032, description: 'Consumer electronics and semiconductor manufacturing.' },
  { type: 'stock-hynix', symbol: '000660.KS', name: 'SK Hynix', market: 'stocks', category: 'Semiconductors', basePrice: 848, volatility: 0.28, circulatingSupply: 720000000, volumeRate: 0.06, description: 'Memory chips and high-bandwidth memory.' },
  { type: 'stock-coca-cola', symbol: 'KO', name: 'Coca-Cola', market: 'stocks', category: 'Consumer staples', basePrice: 72, volatility: 0.09, circulatingSupply: 4300000000, volumeRate: 0.022, description: 'Global beverage brands and distribution.' },
  { type: 'stock-jpmorgan', symbol: 'JPM', name: 'JPMorgan Chase', market: 'stocks', category: 'Financials', basePrice: 294, volatility: 0.15, circulatingSupply: 2800000000, volumeRate: 0.025, description: 'Banking, payments and financial services.' },
  { type: 'crypto-btc', symbol: 'BTC', name: 'Bitcoin', market: 'crypto', category: 'Layer 1', basePrice: 62715, volatility: 0.58, circulatingSupply: 19800000, volumeRate: 0.025, description: 'A scarce, decentralized digital asset.' },
  { type: 'crypto-eth', symbol: 'ETH', name: 'Ethereum', market: 'crypto', category: 'Layer 1', basePrice: 3180, volatility: 0.62, circulatingSupply: 120000000, volumeRate: 0.04, description: 'A programmable blockchain network.' },
  { type: 'crypto-bnb', symbol: 'BNB', name: 'BNB', market: 'crypto', category: 'Exchange ecosystem', basePrice: 579, volatility: 0.55, circulatingSupply: 140000000, volumeRate: 0.055, description: 'Utility asset across a major exchange ecosystem.' },
  { type: 'crypto-xrp', symbol: 'XRP', name: 'XRP', market: 'crypto', category: 'Payments', basePrice: 0.97, volatility: 0.7, circulatingSupply: 58000000000, volumeRate: 0.06, description: 'A digital asset focused on cross-border value transfer.' },
  { type: 'crypto-sol', symbol: 'SOL', name: 'Solana', market: 'crypto', category: 'Layer 1', basePrice: 73, volatility: 0.72, circulatingSupply: 550000000, volumeRate: 0.075, description: 'A high-throughput smart-contract network.' },
  { type: 'crypto-trx', symbol: 'TRX', name: 'TRON', market: 'crypto', category: 'Layer 1', basePrice: 0.31, volatility: 0.48, circulatingSupply: 95000000000, volumeRate: 0.065, description: 'A blockchain ecosystem for digital content and transfers.' },
  { type: 'crypto-doge', symbol: 'DOGE', name: 'Dogecoin', market: 'crypto', category: 'Meme', basePrice: 0.16, volatility: 0.9, circulatingSupply: 150000000000, volumeRate: 0.09, description: 'A highly speculative community-driven cryptocurrency.' },
  { type: 'crypto-ada', symbol: 'ADA', name: 'Cardano', market: 'crypto', category: 'Layer 1', basePrice: 0.62, volatility: 0.66, circulatingSupply: 36000000000, volumeRate: 0.07, description: 'A research-led proof-of-stake blockchain.' }
];

export function getMarketAsset(type: InvestmentType) { return MARKET_ASSETS.find((asset) => asset.type === type); }
