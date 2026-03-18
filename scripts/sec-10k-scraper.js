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
    'User-Agent': 'OpenClaw/1.0 (research@openclaw.ai)',
    'Accept': 'application/json',
  }
});

let DELAY_MS = 30000; // 30 seconds
let count = 0;

async function delay() {
  count++;
  console.log(`⏳ Waiting ${DELAY_MS/1000}s before request ${count}...`);
  return new Promise(resolve => setTimeout(resolve, DELAY_MS));
}

async function getFilings(cik) {
  const url = `https://data.sec.gov/submissions/CIK${cik.padStart(10, '0')}.json`;
  const response = await axiosInstance.get(url);
  return response.data;
}

async function scrapeBuilder(builder) {
  console.log(`\n📊 Fetching ${builder.ticker} (CIK: ${builder.cik})...`);
  await delay();
  
  try {
    const data = await getFilings(builder.cik);
    const filings = data.filings.recent;
    
    const tenKs = filings.filter(f => f.form === '10-K').slice(0, 5);
    const tenQs = filings.filter(f => f.form === '10-Q').slice(0, 5);
    
    console.log(`   10-Ks found: ${tenKs.length}`);
    console.log(`   10-Qs found: ${tenQs.length}`);
    
    if (tenKs.length > 0) {
      console.log(`   Latest 10-K: ${tenKs[0].filingDate} - ${tenKs[0].accessionNumber}`);
    }
    
    return { ticker: builder.ticker, tenKs, tenQs };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🏠 SEC 10-K/10-Q Scraper');
  console.log(`📋 Processing ${BUILDERS.length} builders with ${DELAY_MS/1000}s delay...\n`);
  
  const results = [];
  for (const builder of BUILDERS) {
    const result = await scrapeBuilder(builder);
    if (result) results.push(result);
  }
  
  console.log('\n✅ Summary:');
  results.forEach(r => {
    console.log(`   ${r.ticker}: ${r.tenKs.length} 10-Ks, ${r.tenQs.length} 10-Qs`);
  });
}

main();
