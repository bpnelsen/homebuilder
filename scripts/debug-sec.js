const axios = require('axios');

const client = axios.create({
  headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
});

async function test() {
  const res = await client.get('https://data.sec.gov/submissions/CIK0000920760.json');
  const data = res.data;
  console.log('Top keys:', Object.keys(data));
  console.log('Filings keys:', Object.keys(data.filings || {}));
  console.log('Recent type:', typeof data.filings?.recent);
  console.log('Recent is array?:', Array.isArray(data.filings?.recent));
  if (data.filings?.recent) {
    console.log('Recent sample:', JSON.stringify(data.filings.recent[0]));
  }
}

test();
