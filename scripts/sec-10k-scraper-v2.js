require('dotenv').config({ path: '.env.production' });
const axios = require('axios');

const BUILDERS = [
  { ticker: 'LEN', cik: '0000918920' },
  { ticker: 'DHI', cik: '0000882184' },
  { ticker: 'KBH', cik: '0000755704' },
  { ticker: 'TOL', cik: '0000794717' },
  { ticker: 'PHM', cik: '0000822416' },
  { ticker: 'NVR', cik: '0000925403' },
  { ticker: 'TPH', cik: '0001566860' },
  { ticker: 'CVCO', cik: '0000954088' },
  { ticker: 'LGIH', cik: '0001560090' },
];

const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/html, */*',
    'Host': 'data.sec.gov',
  }
});

const DELAY_MS = 30000;

async function delay(msg) {
  console.log(`⏳ ${msg} - waiting ${DELAY_MS/1000}s...`);
  return new Promise(resolve => setTimeout(resolve, DELAY_MS));
}

async function getFilings(cik) {
  const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
  const res = await axiosInstance.get(url);
  return res.data;
}

async function scrapeBuilder(builder) {
  console.log(`\n📊 ${builder.ticker} (CIK: ${builder.cik})...`);
  await delay(`Fetched ${builder.ticker}`);
  
  try {
    const data = await getFilings(builder.cik);
    
    if (!data.filings || !data.filings.recent) {
      console.log(`   ⚠️  No filings found`);
      return { ticker: builder.ticker, tenKs: [], tenQs: [], error: 'No filings' };
    }
    
    const filings = data.filings.recent;
    const tenKs = filings.filter(f => f.form === '10-K') || [];
    const tenQs = filings.filter(f => f.form === '10-Q') || [];
    
    console.log(`   ✓ 10-Ks: ${tenKs.length}, 10-Qs: ${tenQs.length}`);
    if (tenKs.length > 0) {
      console.log(`   Latest 10-K: ${tenKs[0].filingDate}`);
    }
    
    return { ticker: builder.ticker, cik: builder.cik, tenKs: tenKs.slice(0, 5), tenQs: tenQs.slice(0, 5) };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { ticker: builder.ticker, error: error.message };
  }
}

async function main() {
  console.log('🏠 SEC 10-K/10-Q Scraper v2\n');
  
  const results = [];
  for (const builder of BUILDERS) {
    const result = await scrapeBuilder(builder);
    results.push(result);
  }
  
  console.log('\n========== RESULTS ==========');
  results.forEach(r => {
    if (r.error) {
      console.log(`${r.ticker}: ERROR - ${r.error}`);
    } else {
      console.log(`${r.ticker}: ${r.tenKs.length} 10-Ks, ${r.tenQs.length} 10-Qs`);
    }
  });
}

main();
