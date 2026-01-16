import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import * as cheerio from 'cheerio';
import YahooFinance from 'yahoo-finance2';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

async function main() {
  console.log("🚀 Starting Daily Scrape Job (Logo Fix V2)...");

  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch top trending stocks
    console.log("1️⃣ Fetching top stocks list from ApeWisdom...");
    const apeResponse = await axios.get('https://apewisdom.io/api/v1.0/filter/all-stocks/page/1');
    const results = apeResponse.data.results;
    
    if (!results || results.length === 0) throw new Error("No stock data found.");

    let topStock = null;
    let quote = null;
    let ticker = "";

    // Find first valid equity
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

    // Fallback
    if (!topStock) {
        topStock = results[0];
        ticker = topStock.ticker.replace(/^(NASDAQ|NYSE|AMEX):/, '');
        quote = await yahooFinance.quote(ticker);
    }

    const cleanName = topStock.name.replace(/&amp;/g, '&');

    // Scrape details and logo
    console.log(`3️⃣ Scraping Details & Logo...`);

    let mentionsChange = 0;
    let upvotesChange = 0;
    let sentimentBullish = 50; 
    
    let finalLogoUrl = `https://ui-avatars.com/api/?name=${ticker}&background=10b981&color=fff&size=256&bold=true&font-size=0.35&length=4`;

    try {
        const { data: html } = await axios.get(`https://apewisdom.io/stocks/${ticker}/`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(html);
        
        $('.details-small-tile').each((i, el) => {
            const title = $(el).find('.tile-title').text().trim();
            
            if (title === 'Mentions' || title === 'Upvotes') {
                const changeText = $(el).find('.tile-value span').text().trim();
                const num = parseFloat(changeText.replace(/[^0-9.-]/g, ''));
                
                if (!isNaN(num)) {
                    if (title === 'Mentions') mentionsChange = num;
                    if (title === 'Upvotes') upvotesChange = num;
                }
            }

            if (title === 'Sentiment') {
                let rawText = $(el).find('.tile-value span').text().trim();
                if (!rawText) rawText = $(el).find('.tile-value').text().trim();
                
                const num = parseFloat(rawText.replace('%', ''));
                if (!isNaN(num)) sentimentBullish = num;
            }
        });

        const logoImg = $('.detail-logo, .company-logo');
        const rawSrc = logoImg.attr('src');

        if (rawSrc) {
            if (rawSrc.startsWith('http')) {
                finalLogoUrl = rawSrc;
            } else {
                finalLogoUrl = `https://apewisdom.io${rawSrc}`;
            }
            console.log(`   🖼️  Found ApeWisdom Logo: ${finalLogoUrl}`);
        } else {
            console.log(`   ℹ️  No ApeWisdom logo found, using Initial Icon.`);
        }

    } catch (e) {
        console.log("   ⚠️ ApeWisdom scraping warning:", e.message);
    }

    // Collect news
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

    // Save to DB
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

    if (stockNews.length > 0) {
        await supabase.from('related_news').delete().eq('log_id', logData.id);
        const newsToInsert = stockNews.map(n => ({
            log_id: logData.id,
            publisher: n.source,      
            title: n.title,           
            link: n.link,             
            published_at: n.publisher 
        }));
        await supabase.from('related_news').insert(newsToInsert);
    }

    console.log("🎉 SUCCESS! Scrape complete.");

  } catch (error) {
    console.error("❌ Fatal Error:", error.message);
  }
}

main();