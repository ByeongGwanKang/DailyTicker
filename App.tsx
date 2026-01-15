import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import HeroSection from './components/HeroSection';
import StockChart from './components/StockChart';
import CommunityStats from './components/CommunityStats';
import SentimentCard from './components/SentimentCard';
import { NewsList } from './components/NewsList';
import { supabase } from './services/supabaseClient';
import { DailyTickerState } from './types';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<DailyTickerState | null>(null);
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        // 1. 최신 로그 가져오기
        const { data: logData, error: logError } = await supabase
          .from('daily_logs')
          .select('*')
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (logError) throw logError;
        if (!logData) throw new Error("No data found in DB");

        // 2. 뉴스 데이터 가져오기
        const { data: newsData, error: newsError } = await supabase
          .from('related_news')
          .select('*')
          .eq('log_id', logData.id)
          .order('published_at', { ascending: false });

        if (newsError) console.error("Error fetching news:", newsError);
        setNews(newsData || []);

        // 3. 데이터 매핑
        const mappedData: DailyTickerState = {
          stock: {
            ticker: logData.ticker,
            name: logData.name,
            price: Number(logData.price),
            changePercent: Number(logData.change_percent),
            logoUrl: logData.logo_url,
            marketCap: "N/A",
            volume: "High"
          },
          chartData: [],
          metrics: {
            mentions: {
              count: logData.mentions_count,
              change: logData.mentions_change || 0
            },
            upvotes: {
              count: logData.upvotes_count,
              change: logData.upvotes_change || 0
            }
          },
          sentiment: {
            bullishPercent: Number(logData.sentiment_bullish),
            bearishPercent: Number(logData.sentiment_bearish),
            totalVolume: logData.mentions_count
          }
        };

        setData(mappedData);

      } catch (error) {
        console.error("Failed to fetch Supabase data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-green-500" />
        <p className="text-white font-medium tracking-wide animate-pulse">Loading Live Market Data...</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-white text-center p-10">데이터를 불러오지 못했습니다.</div>;
  }

  return (
    <Layout>
      <HeroSection stock={data.stock} />
      <StockChart symbol={data.stock.ticker} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <CommunityStats metrics={data.metrics} />
        <SentimentCard sentiment={data.sentiment} />
        <NewsList news={news} />
      </div>
    </Layout>
  );
};

export default App;