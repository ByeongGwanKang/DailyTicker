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

    // [Step 1] ApeWisdom에서 리스트 가져오기
    console.log("1️⃣ Fetching top stocks list from ApeWisdom...");
    const apeResponse = await axios.get('https://apewisdom.io/api/v1.0/filter/all-stocks/page/1');
    const results = apeResponse.data.results;

    if (!results || results.length === 0) throw new Error("No stock data found.");

    let topStock = null;
    let quote = null;
    let ticker = "";

    // [Step 2] 리스트를 순회하며 'EQUITY'(일반 주식) 찾기
    console.log("2️⃣ Finding the first valid EQUITY (skipping ETFs)...");

    for (const stock of results) {
      const tempTicker = stock.ticker.replace(/^(NASDAQ|NYSE|AMEX):/, '');

      try {
        // 야후 파이낸스에서 정보 조회
        const tempQuote = await yahooFinance.quote(tempTicker);

        // quoteType이 'EQUITY'인 경우에만 선택 (ETF, CRYPTOCURRENCY 등 제외)
        if (tempQuote.quoteType === 'EQUITY') {
          topStock = stock;
          quote = tempQuote;
          ticker = tempTicker;
          console.log(`✅ Target Found: ${ticker} (${tempQuote.longName}) - Type: ${tempQuote.quoteType}`);
          break; // 찾았으므로 루프 종료
        } else {
          console.log(`   ⏭️ Skipping ${tempTicker}: It is a ${tempQuote.quoteType}`);
        }
      } catch (e) {
        console.warn(`   ⚠️ Could not validate ${tempTicker}, skipping...`);
      }
    }

    // 만약 리스트를 다 돌았는데도 주식을 못 찾았다면, 부득이하게 1위를 선택하거나 에러 처리
    if (!topStock) {
      console.warn("⚠️ No EQUITY found in the list! Falling back to rank #1.");
      topStock = results[0];
      ticker = topStock.ticker.replace(/^(NASDAQ|NYSE|AMEX):/, '');
      quote = await yahooFinance.quote(ticker);
    }

    const cleanName = topStock.name.replace(/&amp;/g, '&');

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

    // [Step 5] Analysts (Yahoo Finance 대체 코드)
    const analystRatings = [];
    try {
      // 'upgradeDowngradeHistory' 모듈 사용
      const result = await yahooFinance.quoteSummary(ticker, { modules: ['upgradeDowngradeHistory'] });
      const history = result.upgradeDowngradeHistory.history;

      // 최신 4개만 가져오기
      history
        .sort((a, b) => b.epochGradeDate - a.epochGradeDate)
        .slice(0, 4)
        .forEach((item, index) => {
          analystRatings.push({
            firm: item.firm,
            rating: item.toGrade || item.fromGrade, // 등급 (Buy, Hold 등)
            target_price: 0, // Yahoo API는 개별 목표가를 잘 주지 않으므로 0 또는 N/A 처리
            rating_date: new Date(item.epochGradeDate).toISOString().split('T')[0]
          });
        });
    } catch (e) {
      console.log("   ⚠️ Yahoo Analyst data failed:", e.message);
    }
    console.log("Collected Analyst Ratings:", analystRatings);
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