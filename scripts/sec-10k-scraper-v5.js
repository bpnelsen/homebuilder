require('dotenv').config({ path: '.env.production' });
const axios = require('axios');

const BUILDERS = [
  { ticker: 'LEN', cik: '0000920760' },
  { ticker: 'DHI', cik: '0000882184' },
  { ticker: 'KBH', cik: '0000795266' },
  { ticker: 'TOL', cik: '0000794170' },
  { ticker: 'PHM', cik: '0000822416' },
  { ticker: 'NVR', cik: '0000906163' },
  { ticker: 'TPH', cik: '0001561680' },
  { ticker: 'CVCO', cik: '0000278166' },
  { ticker: 'LGIH', cik: '0001580670' },
];

const client = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'Accept': 'application/json',
  }
});

const DELAY_MS = 30000;

async function delay(msg) {
  console.log(`⏳ ${msg} - waiting ${DELAY_MS/1000}s...`);
  return new Promise(resolve => setTimeout(resolve, DELAY_MS));
}

async function scrapeBuilder(builder) {
  console.log(`\n📊 ${builder.ticker} (CIK: ${builder.cik})...`);
  await delay(`Fetching ${builder.ticker}`);
  
  try {
    const url = `https://data.sec.gov/submissions/CIK${builder.cik}.json`;
    const res = await client.get(url);
    const recent = res.data?.filings?.recent;
    
    if (!recent || !recent.form) {
      console.log(`   ⚠️ No filings found`);
      return { ticker: builder.ticker, tenKs: [], tenQs: [] };
    }
    
    // Filter by form type
    const tenKIndices = recent.form.map((f, i) => f === '10-K' ? i : -1).filter(i => i >= 0);
    const tenQIndices = recent.form.map((f, i) => f === '10-Q' ? i : -1).filter(i => i >= 0);
    
    const tenKs = tenKIndices.map(i => ({
      filingDate: recent.filingDate[i],
      reportDate: recent.reportDate[i],
      accessionNumber: recent.accessionNumber[i],
      form: recent.form[i],
    })).slice(0, 5);
    
    const tenQs = tenQIndices.map(i => ({
      filingDate: recent.filingDate[i],
      reportDate: recent.reportDate[i],
      accessionNumber: recent.accessionNumber[i],
      form: recent.form[i],
    })).slice(0, 5);
    
    console.log(`   ✓ 10-Ks: ${tenKs.length}, 10-Qs: ${tenQs.length}`);
    if (tenKs.length) console.log(`   Latest 10-K: ${tenKs[0].filingDate}`);
    
    return { ticker: builder.ticker, tenKs, tenQs };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { ticker: builder.ticker, error: error.message };
  }
}

async function main() {
  console.log('🏠 SEC 10-K/10-Q Scraper v5\n');
  
  const results = [];
  for (const builder of BUILDERS) {
    const result = await scrapeBuilder(builder);
    results.push(result);
  }
  
  console.log('\n========== RESULTS ==========');
  results.forEach(r => {
    if (r.error) console.log(`${r.ticker}: ERROR - ${r.error}`);
    else console.log(`${r.ticker}: ${r.tenKs.length} 10-Ks, ${r.tenQs.length} 10-Qs`);
  });
}

main();
