const axios = require('axios');

const SEARCH = ['LEN', 'DHI', 'KBH', 'TOL', 'PHM', 'NVR', 'TPH', 'CVCO', 'LGIH'];

async function getCIK(ticker) {
  try {
    const res = await axios.get(
      `https://efts.sec.gov/LATEST/search?q=${ticker}&dateRange=custom&startdt=2024-01-01&enddt=2026-12-31&forms=10-K`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    console.log(ticker, res.data?.hits?.hits?.[0]?._source?.cik || 'NOT FOUND');
  } catch(e) {
    console.log(ticker, 'ERROR:', e.message);
  }
}

SEARCH.forEach(t => getCIK(t));
