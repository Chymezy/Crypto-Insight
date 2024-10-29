export interface PortfolioAsset {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  value: number;
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  totalValue: number;
  assets: PortfolioAsset[];
}

export interface AssetPerformance {
  coinId: string;
  startValue: number;
  endValue: number;
  change: number;
  changePercentage: number;
}

export interface PortfolioPerformance {
  timeframe: string;
  startValue: number;
  endValue: number;
  change: number;
  changePercentage: number;
  assetPerformances: AssetPerformance[];
}

// Add this line to export the Asset type
export type Asset = PortfolioAsset;
