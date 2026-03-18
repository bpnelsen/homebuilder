const axios = require('axios');

const client = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML like Gecko) Chrome/120.0.0.0 Safari/537.36',
  }
});

// Try different URL formats
async function test() {
  const cik = '0000920760'; // LEN
  
  const urls = [
    `https://data.sec.gov/submissions/${cik}.json`,
    `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`,
    `https://efts.sec.gov/LATEST/search?q=LEN&dateRange=custom&startdt=2024-01-01&enddt=2026-12-31&forms=10-K`,
  ];
  
  for (const url of urls) {
    console.log(`\nTrying: ${url.slice(0, 80)}...`);
    try {
      const res = await client.get(url);
      console.log(`  Status: ${res.status}`);
      console.log(`  Data type: ${typeof res.data}`);
    } catch (e) {
      console.log(`  Error: ${e.response?.status} - ${e.message}`);
    }
  }
}

test();
