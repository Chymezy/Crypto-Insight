export interface Asset {
  name: string;
  symbol: string;
  value: number;
  change: number;
  color: string;
}

export interface PortfolioData {
  totalValue: number;
  change: number;
  assets: Asset[];
}

export interface PerformanceData {
  date: string;
  value: number;
}

export interface Transaction {
  id: number;
  date: string;
  type: string;
  asset: string;
  amount: number;
  value: number;
}

export interface DetailedAsset {
  id: string;
  name: string;
  symbol: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  totalVolume: number;
  high24h: number;
  low24h: number;
  priceChange24h: number;
  priceChange7d?: number;
  priceChange30d?: number;
  priceChange1h?: number;
  circulatingSupply: number;
  totalSupply: number | null;
  maxSupply: number | null;
  allTimeHigh: {
    price: number;
    date: string;
  };
  allTimeLow: {
    price: number;
    date: string;
  };
  description: string;
  website: string | null;
  explorer: string | null;
  reddit: string | null;
  github: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Crypto {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
}
