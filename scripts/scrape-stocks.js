#!/usr/bin/env node
/**
 * Daily Stock Price Update Script
 * Uses Google Finance for stock data
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Home builder tickers - mapped to Google Finance format
const HOME_BUILDERS = [
  { ticker: 'LEN', name: 'Lennar', exchange: 'NYSE' },
  { ticker: 'DHI', name: 'D.R. Horton', exchange: 'NYSE' },
  { ticker: 'KBH', name: 'KB Home', exchange: 'NYSE' },
  { ticker: 'TOL', name: 'Toll Brothers', exchange: 'NYSE' },
  { ticker: 'PHM', name: 'PulteGroup', exchange: 'NYSE' },
  { ticker: 'NVR', name: 'NVR Inc', exchange: 'NYSE' },
  { ticker: 'TPH', name: 'Tri Pointe Homes', exchange: 'NYSE' },
  { ticker: 'MDC', name: 'M.D.C. Holdings', exchange: 'NYSE' },
  { ticker: 'CVCO', name: 'Cavco Industries', exchange: 'NASDAQ' },
  { ticker: 'LGIH', name: 'LGI Homes', exchange: 'NASDAQ' },
];

// Google Finance API endpoint
async function getStockPrice(ticker, exchange) {
  try {
    const response = await axios.get(
      `https://www.google.com/finance/quote/${ticker}:${exchange}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000
      }
    );

    const html = response.data;
    
    // Extract price
    const priceMatch = html.match(/class="YMlKec fxKbKc">([\$0-9,\.]+)</);
    // Extract change percent
    const changeMatch = html.match(/class="JwBmf[^"]*">([+-]?[\d,\.]+)%/);
    // Extract volume
    const volumeMatch = html.match(/(\d+(?:\.\d+)?)[KMB]?\.?(\d*)\s*shares/);
    
    if (priceMatch) {
      const price = parseFloat(priceMatch[1].replace('$', '').replace(',', ''));
      const changePercent = changeMatch ? parseFloat(changeMatch[1]) : 0;
      
      return {
        ticker,
        price,
        changePercent,
      };
    }
    
    console.log(`⚠️ Could not parse ${ticker}: ${html.substring(0, 200)}`);
    return null;
  } catch (error) {
    console.error(`❌ Failed to fetch ${ticker}:`, error.message);
    return null;
  }
}

async function updateStockPrices() {
  try {
    console.log('🔄 Starting stock price update (Google Finance)...');
    console.log(`📊 Updating ${HOME_BUILDERS.length} builders`);

    // Fetch current quotes
    const quotes = [];
    for (const builder of HOME_BUILDERS) {
      const quote = await getStockPrice(builder.ticker, builder.exchange);
      if (quote) {
        quotes.push(quote);
        console.log(`✓ ${builder.ticker}: $${quote.price} (${quote.changePercent}%)`);
      }
      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(`\n📈 Retrieved ${quotes.length} stock prices`);

    // Get builder IDs from database
    const { data: builders } = await supabase
      .from('builders')
      .select('id, ticker')
      .in('ticker', quotes.map((q) => q.ticker));

    console.log(`📋 Found ${builders.length} builders in database`);

    if (!builders || builders.length === 0) {
      console.log('⚠️ No builders found in database. Skipping database update.');
      return true;
    }

    // Insert stock prices
    const today = new Date().toISOString().split('T')[0];
    const priceRecords = quotes.map((quote) => {
      const builder = builders.find((b) => b.ticker === quote.ticker);
      return {
        builder_id: builder?.id,
        price: quote.price,
        change_percent: quote.changePercent,
        date: today,
      };
    }).filter(r => r.builder_id);

    // Delete existing records for today, then insert new ones
    const todayStart = today + 'T00:00:00.000Z';
    const todayEnd = today + 'T23:59:59.999Z';
    
    const { error: deleteError } = await supabase
      .from('stock_prices')
      .delete()
      .gte('date', todayStart)
      .lte('date', todayEnd);
    
    if (deleteError) {
      console.log('⚠️ Delete warning:', deleteError.message);
    }
    
    // Insert fresh records
    const { error: insertError } = await supabase
      .from('stock_prices')
      .insert(priceRecords);

    if (insertError) {
      console.error('❌ Database insert error:', insertError);
    } else {
      console.log(`✅ Updated ${priceRecords.length} stock prices`);
    }

    if (insertError) {
      console.error('❌ Database insert error:', insertError);
    } else {
      console.log(`✅ Updated ${priceRecords.length} stock prices`);
    }

    console.log(`📅 Date: ${today}`);
    console.log('✅ Stock price update complete!');

    return true;
  } catch (error) {
    console.error('❌ Stock price update failed:', error);
    process.exit(1);
  }
}

// Run update
updateStockPrices();
