import React, { useEffect, useState } from 'react';
import Layout from './components/Layout';
import HeroSection from './components/HeroSection';
import StockChart from './components/StockChart';
import CommunityStats from './components/CommunityStats';
import SentimentCard from './components/SentimentCard';
import AnalystList from './components/AnalystList';
import { supabase } from './services/supabaseClient'; // 방금 만든 클라이언트 import
import { DailyTickerState, AnalystRating } from './types';
import {
  Loader2,
  TrendingUp, 
  TrendingDown, 
  Minus
} from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<DailyTickerState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        // 1. 오늘 날짜의 최신 로그 가져오기 (daily_logs 테이블)
        const { data: logData, error: logError } = await supabase
          .from('daily_logs')
          .select('*')
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (logError) throw logError;
        if (!logData) throw new Error("No data found in DB");

        // 2. 해당 로그의 애널리스트 평가 가져오기 (analyst_ratings 테이블)
        const { data: analystData, error: analystError } = await supabase
          .from('analyst_ratings')
          .select('*')
          .eq('log_id', logData.id);

        if (analystError) console.warn("Analyst fetch error:", analystError);

        // 3. DB 데이터를 앱에서 사용하는 형태로 변환 (Mapping)
        const mappedData: DailyTickerState = {
          stock: {
            ticker: logData.ticker,
            name: logData.name,
            price: Number(logData.price),
            changePercent: Number(logData.change_percent),
            logoUrl: logData.logo_url,
            marketCap: "N/A", // 크롤링에 없으면 N/A 처리
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
          },
          analysts: (analystData || []).map((a: any, index: number) => ({
            id: index,
            firm: a.firm,
            rating: a.rating,
            targetPrice: a.target_price,
            date: a.rating_date
          }))
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
      <div className="min-h-screen bg-daily-bg flex flex-col items-center justify-center text-daily-accent">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-white font-medium tracking-wide animate-pulse">Loading Live Market Data...</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-white text-center p-10">데이터를 불러오지 못했습니다. DB를 확인해주세요.</div>;
  }

  return (
    <Layout>
      <HeroSection stock={data.stock} />
      <StockChart symbol={data.stock.ticker} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CommunityStats metrics={data.metrics} />
        
        <SentimentCard sentiment={data.sentiment} />
        <AnalystList ratings={data.analysts} />
      </div>
    </Layout>
  );
};

export default App;