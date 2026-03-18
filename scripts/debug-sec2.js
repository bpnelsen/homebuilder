const axios = require('axios');

const client = axios.create({
  headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' }
});

async function test() {
  const res = await client.get('https://data.sec.gov/submissions/CIK0000920760.json');
  const recent = res.data.filings.recent;
  console.log('Recent keys:', Object.keys(recent).slice(0, 20));
  console.log('Form sample:', recent.form?.slice(0, 5));
  console.log('FilingDate sample:', recent.filingDate?.slice(0, 5));
}

test();
