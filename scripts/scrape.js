import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import YahooFinance from 'yahoo-finance2'; // 대문자 클래스 가져오기
import dotenv from 'dotenv';

dotenv.config();

// Supabase 연결
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Yahoo Finance 초기화 (알림 끄기 옵션 추가)
const yahooFinance = new YahooFinance({
  suppressNotices: ['yahooSurvey'] 
});

async function main() {
  console.log("🚀 Starting Daily Scrape Job...");

  try {
    // --- [Step 1] ApeWisdom 1위 종목 ---
    console.log("1️⃣ Fetching top stock from ApeWisdom API...");
    const apeResponse = await axios.get('https://apewisdom.io/api/v1.0/filter/all-stocks/page/1');
    const topStock = apeResponse.data.results[0];

    if (!topStock) throw new Error("No stock data found.");

    const ticker = topStock.ticker.replace(/^(NASDAQ|NYSE|AMEX):/, '');
    const cleanName = topStock.name.replace(/&amp;/g, '&');
    console.log(`✅ Target: ${ticker} (${cleanName})`);

    // --- [Step 2] Yahoo Finance 가격 ---
    console.log(`2️⃣ Fetching price for ${ticker}...`);
    const quote = await yahooFinance.quote(ticker);
    
    // --- [Step 3] Sentiment 상세 크롤링 ---
    console.log(`3️⃣ Scraping sentiment...`);
    let sentimentBullish = 50;
    try {
      const { data: html } = await axios.get(`https://apewisdom.io/stocks/${ticker}/`);
      const $ = cheerio.load(html);
      const text = $('.sentiment-value').first().text().replace('%', '').trim();
      if (text) sentimentBullish = parseFloat(text);
    } catch (e) {
      console.log("⚠️ Sentiment default used.");
    }

    // --- [Step 4] Finviz 애널리스트 평가 (수정된 부분) ---
    console.log(`4️⃣ Scraping analyst ratings...`);
    const analystRatings = [];
    try {
      const finvizUrl = `https://finviz.com/quote.ashx?t=${ticker}`;
      const { data: finvizHtml } = await axios.get(finvizUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const $finviz = cheerio.load(finvizHtml); // 변수명 $finviz

      // [수정] 여기서 $ 대신 $finviz 를 사용해야 합니다!
      $finviz('.fullview-ratings-outer tr').each((i, row) => {
        if (analystRatings.length >= 4) return; 

        const cols = $finviz(row).find('td');
        if (cols.length >= 5) {
            const date = $finviz(cols[0]).text().trim();
            const firm = $finviz(cols[2]).text().trim();
            const rating = $finviz(cols[3]).text().trim();
            const target = $finviz(cols[4]).text().trim();

            analystRatings.push({ firm, rating, target_price: parseFloat(target) || 0, rating_date: date });
        }
      });
    } catch (e) {
      console.warn("⚠️ Failed to scrape analysts:", e.message);
    }

    // --- [Step 5] Supabase 저장 ---
    console.log("5️⃣ Saving to DB...");
    const { data: logData, error: logError } = await supabase
      .from('daily_logs')
      .insert({
        date: new Date().toISOString().split('T')[0],
        ticker: ticker,
        name: cleanName,
        logo_url: `https://logo.clearbit.com/${cleanName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        price: quote.regularMarketPrice,
        change_percent: quote.regularMarketChangePercent,
        mentions_count: parseInt(topStock.mentions) || 0,
        upvotes_count: parseInt(topStock.upvotes) || 0,
        sentiment_bullish: sentimentBullish,
        sentiment_bearish: 100 - sentimentBullish
      })
      .select()
      .single();

    if (logError) {
        if (logError.code === '23505') {
            console.log("⚠️ Data for today already exists. Skipping insert.");
            return;
        }
        throw logError;
    }

    if (analystRatings.length > 0) {
      const ratingsToInsert = analystRatings.map(r => ({
        log_id: logData.id,
        firm: r.firm,
        rating: r.rating,
        target_price: r.target_price,
        rating_date: r.rating_date
      }));

      const { error: ratingError } = await supabase.from('analyst_ratings').insert(ratingsToInsert);
      if (ratingError) console.warn("Analyst save error:", ratingError.message);
    }

    console.log("🎉 SUCCESS! All data saved successfully.");

  } catch (error) {
    console.error("❌ Fatal Error:", error.message);
  }
}

main();