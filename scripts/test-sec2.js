const axios = require('axios');

const client = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML like Gecko) Chrome/120.0.0.0 Safari/537.36',
  }
});

async function test() {
  const cik = '0000920760';
  
  // Try CIK prefix
  const url = `https://data.sec.gov/submissions/CIK${cik}.json`;
  console.log(`Trying: ${url}`);
  const res = await client.get(url);
  console.log(`Status: ${res.status}`);
  console.log(`Keys: ${Object.keys(res.data).slice(0, 10)}`);
}

test();
