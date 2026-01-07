import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import HeroSection from './components/HeroSection';
import StockChart from './components/StockChart';
import CommunityStats from './components/CommunityStats';
import SentimentCard from './components/SentimentCard';
import AnalystList from './components/AnalystList';
import { fetchDailyTopStock } from './services/mockData';
import { DailyTickerState } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<DailyTickerState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initData = async () => {
      try {
        const result = await fetchDailyTopStock();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-daily-bg flex flex-col items-center justify-center text-daily-accent">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-white font-medium tracking-wide animate-pulse">Scanning Market Data...</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-white text-center p-10">Error loading data.</div>;
  }

  return (
    <Layout>
      {/* 1. Top: Hero Section (Name + Logo + Stats) */}
      <HeroSection stock={data.stock} />

      {/* 2. Middle: TradingView Chart */}
      <StockChart symbol={data.stock.ticker} />

      {/* 3. Bottom: Grid Layout for Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Block 1: Mentions & Upvotes */}
        <CommunityStats metrics={data.metrics} />

        {/* Block 2: Sentiment */}
        <SentimentCard sentiment={data.sentiment} />

        {/* Block 3: Analyst Analysis */}
        <AnalystList ratings={data.analysts} />
      </div>
    </Layout>
  );
};

export default App;