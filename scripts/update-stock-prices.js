/**
 * Script to update stock prices for all homebuilders
 * Uses Yahoo Finance chart API (no auth required)
 * Run: node scripts/update-stock-prices.js
 */

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rrpkokhjomvlumreknuq.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycGtva2hqb212bHVtcmVrbnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkwOTU5MSwiZXhwIjoyMDg3NDg1NTkxfQ.kFTdS-I7SnPPkgqYu0amlzLQgnGJppb4ZKkfIyCy0JA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

const BUILDERS = [
  { name: 'KB Home', ticker: 'KBH' },
  { name: 'Toll Brothers', ticker: 'TOL' },
  { name: 'PulteGroup', ticker: 'PHM' },
  { name: 'Lennar', ticker: 'LEN' },
  { name: 'D.R. Horton', ticker: 'DHI' },
  { name: 'Tri Pointe Homes', ticker: 'TPH' },
  { name: 'NVR Inc', ticker: 'NVR' },
  { name: 'LGI Homes', ticker: 'LGIH' },
  { name: 'MDC Holdings', ticker: 'MDC' },
  { name: 'Cavco Industries', ticker: 'CVCO' },
];

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const API_BASE = 'https://query2.finance.yahoo.com';

async function getQuote(ticker) {
  try {
    const url = `${API_BASE}/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT }
    });
    
    const result = response.data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators.quote[0];
    const lastClose = quote.close[quote.close.length - 1];
    const prevClose = quote.close[quote.close.length - 2] || lastClose;
    const change = lastClose - prevClose;
    const changePercent = (change / prevClose) * 100;
    
    return {
      price: meta.regularMarketPrice,
      changePercent: changePercent,
      marketCap: null, // Not available in chart endpoint
    };
  } catch (error) {
    console.error(`❌ Failed to fetch ${ticker}:`, error.message);
    return null;
  }
}

async function updateStockPrices() {
  console.log('🚀 Starting stock price update...\n');
  
  for (const builder of BUILDERS) {
    console.log(`📈 Fetching ${builder.name} (${builder.ticker})...`);
    
    const quote = await getQuote(builder.ticker);
    
    if (quote) {
      // Get builder ID from database
      const { data: builderData } = await supabase
        .from('builders')
        .select('id')
        .eq('ticker', builder.ticker)
        .single();
      
      if (builderData) {
        // Insert stock price (schema: id, builder_id, price, market_cap, change_percent, date)
        const { error } = await supabase
          .from('stock_prices')
          .insert({
            builder_id: builderData.id,
            date: new Date().toISOString(),
            price: quote.price,
            market_cap: quote.marketCap,
            change_percent: quote.changePercent,
          });
        
        if (error) {
          console.error(`   ❌ Error inserting price: ${error.message}`);
        } else {
          console.log(`   ✅ Updated: $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`);
        }
      } else {
        console.log(`   ⚠️ Builder not found in database`);
      }
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✨ Stock price update complete!');
}

updateStockPrices().catch(console.error);