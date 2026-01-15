export interface StockData {
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  logoUrl: string;
  marketCap: string;
  volume: string;
}

export interface ChartPoint {
  time: string;
  price: number;
}

export interface CommunityMetrics {
  mentions: {
    count: number;
    change: number; // Percentage
  };
  upvotes: {
    count: number;
    change: number; // Percentage
  };
}

export interface SentimentData {
  bullishPercent: number;
  bearishPercent: number;
  totalVolume: number;
}

export interface DailyTickerState {
  stock: StockData;
  chartData: ChartPoint[];
  metrics: CommunityMetrics;
  sentiment: SentimentData;
}