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
    change: number;
  };
  upvotes: {
    count: number;
    change: number;
  };
}

export interface SentimentData {
  bullishPercent: number;
  bearishPercent: number;
  totalVolume: number;
}

export interface NewsItem {
  id?: number;
  publisher: string;
  title: string;
  link: string;
  published_at: string;
}

export interface DailyTickerState {
  stock: StockData;
  chartData: ChartPoint[];
  metrics: CommunityMetrics;
  sentiment: SentimentData;
  news: NewsItem[];
}