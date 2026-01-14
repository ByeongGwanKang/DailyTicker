import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import YahooFinance from 'yahoo-finance2';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

async function main() {
  console.log("🚀 Starting Daily Scrape Job (Unified Structure)...");

  try {
    const today = new Date().toISOString().split('T')[0];

    // [Step 1] ApeWisdom
    console.log("1️⃣ Fetching top stock from ApeWisdom...");
    const apeResponse = await axios.get('https://apewisdom.io/api/v1.0/filter/all-stocks/page/1');
    const topStock = apeResponse.data.results[0];
    if (!topStock) throw new Error("No stock data found.");

    const ticker = topStock.ticker.replace(/^(NASDAQ|NYSE|AMEX):/, '');
    const cleanName = topStock.name.replace(/&amp;/g, '&');
    console.log(`✅ Target: ${ticker} (${cleanName})`);

    // [Step 2] Yahoo Finance
    console.log(`2️⃣ Fetching price for ${ticker}...`);
    const quote = await yahooFinance.quote(ticker);
    
    // [Step 3] 티커 아이콘
    const finalLogoUrl = `https://ui-avatars.com/api/?name=${ticker}&background=10b981&color=fff&size=256&bold=true&font-size=0.35&length=4`;

    // [Step 4] ★ 상세 페이지 크롤링 (통합 구조 대응) ★
    console.log(`3️⃣ Scraping Details (Looping Tiles)...`);
    
    let mentionsChange = 0;
    let upvotesChange = 0;
    let sentimentBullish = 50; // 기본값

    try {
      const { data: html } = await axios.get(`https://apewisdom.io/stocks/${ticker}/`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      });
      const $ = cheerio.load(html);

      // 모든 'details-small-tile' 박스를 순회합니다.
      $('.details-small-tile').each((i, el) => {
          const title = $(el).find('.tile-title').text().trim(); // 제목 (Mentions, Upvotes, Sentiment)
          
          // 1. Mentions 찾기 (변화율은 span 안에 있음)
          if (title === 'Mentions') {
              const changeText = $(el).find('.tile-value span').text().trim(); // "+0%"
              const num = parseFloat(changeText.replace('%', '').replace('+', ''));
              if (!isNaN(num)) {
                  mentionsChange = num;
                  console.log(`   📉 Mentions Change: ${num}%`);
              }
          }

          // 2. Upvotes 찾기 (변화율은 span 안에 있음)
          if (title === 'Upvotes') {
              const changeText = $(el).find('.tile-value span').text().trim();
              const num = parseFloat(changeText.replace('%', '').replace('+', ''));
              if (!isNaN(num)) {
                  upvotesChange = num;
                  console.log(`   📈 Upvotes Change: ${num}%`);
              }
          }

          // 3. Sentiment 찾기 (★중요: 점수는 span 밖, tile-value 바로 안에 있음)
          if (title === 'Sentiment') {
              // .tile-value의 전체 텍스트에서 숫자만 추출 (예: "56% ")
              // span 태그 내용을 지우고 순수 숫자만 가져오는 테크닉 사용
              const rawText = $(el).find('.tile-value').clone().children().remove().end().text().trim();
              const num = parseFloat(rawText.replace('%', ''));
              if (!isNaN(num)) {
                  sentimentBullish = num;
                  console.log(`   ❤️ Sentiment Found: ${num}%`);
              }
          }
      });

    } catch (e) {
      console.log("   ⚠️ Detail scraping failed:", e.message);
    }

    // [Step 5] Analysts
    const analystRatings = [];
    try {
      const { data: finvizHtml } = await axios.get(`https://finviz.com/quote.ashx?t=${ticker}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const $finviz = cheerio.load(finvizHtml);
      $finviz('.fullview-ratings-outer tr').each((i, row) => {
        if (analystRatings.length >= 4) return;
        const cols = $finviz(row).find('td');
        if (cols.length >= 5) analystRatings.push({
            firm: $finviz(cols[2]).text().trim(), rating: $finviz(cols[3]).text().trim(),
            target_price: parseFloat($finviz(cols[4]).text().trim()) || 0, rating_date: $finviz(cols[0]).text().trim()
        });
      });
    } catch (e) { /* ignore */ }

    // [Step 6] DB 저장
    console.log("5️⃣ Saving to DB...");

    const { data: logData, error: logError } = await supabase
      .from('daily_logs')
      .upsert({ 
        date: today,
        ticker: ticker,
        name: cleanName,
        logo_url: finalLogoUrl,
        price: quote.regularMarketPrice,
        change_percent: quote.regularMarketChangePercent,
        mentions_count: parseInt(topStock.mentions) || 0,
        upvotes_count: parseInt(topStock.upvotes) || 0,
        mentions_change: mentionsChange,
        upvotes_change: upvotesChange,
        sentiment_bullish: sentimentBullish,
        sentiment_bearish: 100 - sentimentBullish
      }, { onConflict: 'date' })
      .select()
      .single();

    if (logError) throw logError;

    await supabase.from('analyst_ratings').delete().eq('log_id', logData.id);
    if (analystRatings.length > 0) {
        const ratingsToInsert = analystRatings.map(r => ({ log_id: logData.id, ...r }));
        await supabase.from('analyst_ratings').insert(ratingsToInsert);
    }

    console.log("🎉 SUCCESS! All details scraped correctly.");

  } catch (error) {
    console.error("❌ Fatal Error:", error.message);
  }
}

main();