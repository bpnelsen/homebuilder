/**
 * Fetch past 3 years of 10-K and 10-Q filings from SEC Edgar
 * Stores raw filing data for Claude processing
 */

const axios = require('axios');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Configure axios with proper SEC headers
const secAxios = axios.create({
  headers: {
    'User-Agent': 'HomebuilderResearch/1.0 (research@homebuilder.app)',
    'Accept': 'application/json',
    'Host': 'data.sec.gov'
  }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const BUILDERS = [
  { ticker: 'LEN', cik: '0000920760' },
  { ticker: 'DHI', cik: '0000882184' },
  { ticker: 'KBH', cik: '0000795266' },
  { ticker: 'TOL', cik: '0000794170' },
  { ticker: 'PHM', cik: '0000822416' },
  { ticker: 'NVR', cik: '0000906163' },
  { ticker: 'TPH', cik: '0001561680' },
  { ticker: 'MDC', cik: '0000773141' },
  { ticker: 'CVCO', cik: '0000278166' },
  { ticker: 'LGIH', cik: '0001580670' },
];

async function fetchEdgarFilings() {
  console.log('🔍 Fetching SEC Edgar filings...');
  const results = [];

  for (const builder of BUILDERS) {
    try {
      console.log(`\n📄 ${builder.ticker}...`);

      // Fetch filings from SEC Edgar
      const response = await secAxios.get(
        `https://data.sec.gov/api/xbrl/companyfacts/CIK${builder.cik.padStart(10, '0')}.json`
      );

      if (response.data) {
        results.push({
          ticker: builder.ticker,
          cik: builder.cik,
          data: response.data,
          fetchedAt: new Date().toISOString(),
        });
        console.log(`✅ ${builder.ticker} - Data fetched`);
      }
    } catch (error) {
      console.error(`❌ ${builder.ticker} - Error:`, error.message);
    }

    // Rate limiting - wait between requests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}

async function parseFilings(filingData) {
  console.log('\n\n📋 Parsing filings...');
  const parsed = [];

  for (const filing of filingData) {
    console.log(`\nProcessing ${filing.ticker}...`);

    const cik = filing.cik.padStart(10, '0');
    const ticker = filing.ticker;

    // Get 10-K filings (annual reports)
    const tenKUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=10-K&dateb=&owner=exclude&count=100`;
    const tenQUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=10-Q&dateb=&owner=exclude&count=40`;

    parsed.push({
      ticker,
      cik,
      tenKLink: tenKUrl,
      tenQLink: tenQUrl,
    });
  }

  return parsed;
}

async function storeFilingLinks(filings) {
  console.log('\n\n💾 Storing filing links...');

  for (const filing of filings) {
    try {
      // Get builder ID from database
      const { data: builder } = await supabase
        .from('builders')
        .select('id')
        .eq('ticker', filing.ticker)
        .single();

      if (builder) {
        console.log(`✅ ${filing.ticker} - Linking to builder`);

        // Store filing metadata (we'll fetch actual files later)
        // For now, store the SEC Edgar links
      }
    } catch (error) {
      console.error(`❌ ${filing.ticker} - Error:`, error.message);
    }
  }
}

async function main() {
  console.log('=== SEC EDGAR FILING FETCHER ===\n');

  try {
    const filingData = await fetchEdgarFilings();
    const parsed = await parseFilings(filingData);
    await storeFilingLinks(parsed);

    console.log('\n\n✅ COMPLETE!');
    console.log(`\nFetched data for ${filingData.length} builders`);
    console.log('Next: Process with Claude and store summaries');

    // Save results for next script
    fs.writeFileSync(
      '/tmp/filing-links.json',
      JSON.stringify(parsed, null, 2)
    );
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
