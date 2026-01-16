import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import YahooFinance from 'yahoo-finance2';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

async function main() {
    console.log("🚀 Starting Daily Scrape Job (Refactored)...");

    try {
        const today = new Date().toISOString().split('T')[0];

        // [Step 1] ApeWisdom에서 상위 종목 리스트 가져오기
        console.log("1️⃣ Fetching top stocks list from ApeWisdom...");
        const apeResponse = await axios.get('https://apewisdom.io/api/v1.0/filter/all-stocks/page/1');
        const results = apeResponse.data.results;

        if (!results || results.length === 0) throw new Error("No stock data found.");

        let topStock = null;
        let quote = null;
        let ticker = "";

        // [Step 2] 리스트를 순회하며 ETF가 아닌 'EQUITY'(일반 주식) 찾기
        console.log("2️⃣ Finding the first valid EQUITY (skipping ETFs)...");

        for (const stock of results) {
            const tempTicker = stock.ticker.replace(/^(NASDAQ|NYSE|AMEX):/, '');
            try {
                const tempQuote = await yahooFinance.quote(tempTicker);
                if (tempQuote.quoteType === 'EQUITY') {
                    topStock = stock;
                    quote = tempQuote;
                    ticker = tempTicker;
                    console.log(`✅ Target Found: ${ticker} (${tempQuote.longName})`);
                    break;
                } else {
                    console.log(`   ⏭️ Skipping ${tempTicker}: It is a ${tempQuote.quoteType}`);
                }
            } catch (e) {
                console.warn(`   ⚠️ Could not validate ${tempTicker}, skipping...`);
            }
        }

        // Fallback: 유효한 주식을 못 찾았을 경우 1위 강제 선택
        if (!topStock) {
            topStock = results[0];
            ticker = topStock.ticker.replace(/^(NASDAQ|NYSE|AMEX):/, '');
            quote = await yahooFinance.quote(ticker);
        }

        const cleanName = topStock.name.replace(/&amp;/g, '&');

        // [Step 3] 상세 정보 수집 (ApeWisdom 데이터 + 로고)
        console.log(`3️⃣ Scraping Details & Logo...`);

        let mentionsChange = 0;
        let upvotesChange = 0;
        let sentimentBullish = 50;
        let finalLogoUrl = "";

        // 3-1. ApeWisdom 상세 크롤링
        try {
            const { data: html } = await axios.get(`https://apewisdom.io/stocks/${ticker}/`, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            const $ = cheerio.load(html);

            const findStat = (keyword) => {
                const tile = $('.tile-title').filter((i, el) => $(el).text().includes(keyword)).closest('.details-small-tile');
                const rawText = tile.text();
                const match = rawText.match(/([+-]?[\d,.]+)\s*%/);
                if (match) {
                    return parseFloat(match[1].replace(/,/g, '').replace(/\+/g, ''));
                }
                return 0;
            };

            const foundMentions = findStat('Mentions');
            const foundUpvotes = findStat('Upvotes');
            const foundSentiment = findStat('Sentiment');

            if (!isNaN(foundMentions)) mentionsChange = foundMentions;
            if (!isNaN(foundUpvotes)) upvotesChange = foundUpvotes;
            if (!isNaN(foundSentiment)) sentimentBullish = foundSentiment;

        } catch (e) {
            console.log("   ⚠️ ApeWisdom scraping warning:", e.message);
        }
        // 3-2. 로고 추출 (공식 도메인 기반)
        try {
            const summary = await yahooFinance.quoteSummary(ticker, { modules: ['summaryProfile'] });
            if (summary.summaryProfile && summary.summaryProfile.website) {
                let domain = new URL(summary.summaryProfile.website).hostname;
                domain = domain.replace(/^www\./, '').replace(/^investor\./, '').replace(/^ir\./, '');
                finalLogoUrl = `https://logo.clearbit.com/${domain}`;
            } else {
                finalLogoUrl = `https://logo.clearbit.com/${ticker.toLowerCase()}.com`;
            }
        } catch (e) {
            finalLogoUrl = `https://ui-avatars.com/api/?name=${ticker}&background=10b981&color=fff`;
        }

        // [Step 4] 뉴스 수집 (Yahoo Finance Search)
        console.log(`4️⃣ Fetching Latest News...`);

        let stockNews = [];
        try {
            const searchResult = await yahooFinance.search(ticker, { newsCount: 5 });
            if (searchResult.news && searchResult.news.length > 0) {
                stockNews = searchResult.news.map(item => {
                    let dateStr = today;
                    if (item.providerPublishTime) {
                        let dateObj = new Date(item.providerPublishTime);
                        if (dateObj.getFullYear() < 1980) {
                            dateObj = new Date(item.providerPublishTime * 1000);
                        }
                        dateStr = dateObj.toISOString().split('T')[0];
                    }

                    return {
                        publisher: dateStr,
                        source: item.publisher,
                        title: item.title,
                        link: item.link
                    };
                });
            }
            console.log(`   📰 News Collected: ${stockNews.length} items`);
        } catch (e) {
            console.log("   ⚠️ News fetching failed:", e.message);
        }
        // [Step 5] DB 저장
        console.log("5️⃣ Saving to DB...");
        // 5-1. 로그 저장
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
        // 5-2. 뉴스 저장 (기존 뉴스 삭제 후 재입력)
        if (stockNews.length > 0) {
            await supabase.from('related_news').delete().eq('log_id', logData.id);

            const newsToInsert = stockNews.map(n => ({
                log_id: logData.id,
                publisher: n.source,
                title: n.title,
                link: n.link,
                published_at: n.publisher
            }));

            const { error: newsError } = await supabase.from('related_news').insert(newsToInsert);
            if (newsError) console.error("Error saving news:", newsError);
        }

        console.log("🎉 SUCCESS! Cleanup complete.");

    } catch (error) {
        console.error("❌ Fatal Error:", error.message);
    }
}

main();