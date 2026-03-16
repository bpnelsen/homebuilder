#!/usr/bin/env node
/**
 * Populate 10-K filings for all builders
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rrpkokhjomvlumreknuq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Builder CIK mapping (without leading zeros)
const builderCIKs = {
  'LEN': { cik: 920760, name: 'Lennar Corporation' },
  'DHI': { cik: 882184, name: 'D.R. Horton Inc' },
  'KBH': { cik: 795266, name: 'KB Home' },
  'TOL': { cik: 794170, name: 'Toll Brothers Inc' },
  'PHM': { cik: 822416, name: 'PulteGroup Inc' },
  'NVR': { cik: 906163, name: 'NVR Inc' },
  'TPH': { cik: 1561680, name: 'Tri Pointe Homes Inc' },
  'MDC': { cik: 773141, name: 'M.D.C. Holdings Inc' },
  'CVCO': { cik: 278166, name: 'Cavco Industries Inc' },
  'LGIH': { cik: 1580670, name: 'LGI Homes Inc' },
};

// 10-K filings data (from SEC EDGAR search)
const filingsData = {
  'LEN': [
    { fiscal_year: 2025, filing_date: '2026-01-28', adsh: '0001628280-26-003870' },
    { fiscal_year: 2025, filing_date: '2025-01-23', adsh: '0001628280-25-002404' },
    { fiscal_year: 2024, filing_date: '2024-01-24', adsh: '0001628280-24-003125' },
    { fiscal_year: 2023, filing_date: '2023-01-26', adsh: '0001628280-23-002604' },
  ],
  'DHI': [
    { fiscal_year: 2025, filing_date: '2025-11-19', adsh: '0000882184-25-000081' },
    { fiscal_year: 2024, filing_date: '2024-11-19', adsh: '0000882184-24-000057' },
    { fiscal_year: 2023, filing_date: '2023-11-17', adsh: '0000882184-23-000115' },
  ],
  'KBH': [
    { fiscal_year: 2025, filing_date: '2026-01-23', adsh: '0000795266-26-000017' },
    { fiscal_year: 2024, filing_date: '2025-01-24', adsh: '0000795266-25-000014' },
    { fiscal_year: 2023, filing_date: '2024-01-19', adsh: '0000795266-24-000008' },
  ],
  'TOL': [
    { fiscal_year: 2025, filing_date: '2025-12-19', adsh: '0000794170-25-000112' },
    { fiscal_year: 2024, filing_date: '2024-12-20', adsh: '0000794170-24-000051' },
    { fiscal_year: 2023, filing_date: '2023-12-21', adsh: '0000794170-23-000066' },
  ],
  'PHM': [
    { fiscal_year: 2025, filing_date: '2026-02-04', adsh: '0000822416-26-000007' },
    { fiscal_year: 2024, filing_date: '2025-02-06', adsh: '0000822416-25-000007' },
    { fiscal_year: 2023, filing_date: '2024-02-05', adsh: '0000822416-24-000010' },
  ],
  'NVR': [
    { fiscal_year: 2025, filing_date: '2026-02-11', adsh: '0000906163-26-000018' },
    { fiscal_year: 2024, filing_date: '2025-02-12', adsh: '0000906163-25-000011' },
    { fiscal_year: 2023, filing_date: '2024-02-14', adsh: '0000906163-24-000033' },
  ],
  'TPH': [
    { fiscal_year: 2025, filing_date: '2026-02-26', adsh: '0001561680-26-000008' },
    { fiscal_year: 2024, filing_date: '2025-02-21', adsh: '0001561680-25-000029' },
    { fiscal_year: 2023, filing_date: '2024-02-22', adsh: '0001561680-24-000017' },
  ],
  'MDC': [
    { fiscal_year: 2025, filing_date: '2026-01-30', adsh: '0000773141-25-000006' },
    { fiscal_year: 2024, filing_date: '2024-01-30', adsh: '0000773141-24-000004' },
    { fiscal_year: 2023, filing_date: '2023-01-31', adsh: '0000773141-23-000007' },
  ],
  'CVCO': [
    { fiscal_year: 2025, filing_date: '2025-05-23', adsh: '0000278166-25-000057' },
    { fiscal_year: 2024, filing_date: '2024-05-24', adsh: '0000278166-24-000059' },
    { fiscal_year: 2023, filing_date: '2023-05-19', adsh: '0000278166-23-000032' },
  ],
  'LGIH': [
    { fiscal_year: 2025, filing_date: '2026-02-20', adsh: '0001580670-26-000019' },
    { fiscal_year: 2024, filing_date: '2025-02-26', adsh: '0001580670-25-000016' },
    { fiscal_year: 2023, filing_date: '2023-02-21', adsh: '0001580670-23-000020' },
  ],
};

function buildSecUrl(cik, adsh) {
  // CIK should be zero-padded to 10 digits
  const cikStr = cik.toString().padStart(10, '0');
  return `https://www.sec.gov/Archives/edgar/data/${cikStr}/${adsh.replace(/-/g, '')}/${adsh}.htm`;
}

async function populateFilings() {
  try {
    // Get all builders
    const { data: builders, error: buildersError } = await supabase
      .from('builders')
      .select('id, ticker, name');

    if (buildersError) {
      console.error('❌ Error fetching builders:', buildersError);
      throw buildersError;
    }

    console.log(`Found ${builders.length} builders`);

    let inserted = 0;
    let skipped = 0;

    for (const builder of builders) {
      const filings = filingsData[builder.ticker];
      if (!filings) {
        console.log(`⚠️ No filings data for ${builder.ticker}`);
        continue;
      }

      const cikInfo = builderCIKs[builder.ticker];
      if (!cikInfo) continue;

      for (const filing of filings) {
        const secUrl = buildSecUrl(cikInfo.cik, filing.adsh);

        // Check if already exists and update, or insert
        const { data: existing } = await supabase
          .from('filings_10k')
          .select('id')
          .eq('builder_id', builder.id)
          .eq('fiscal_year', filing.fiscal_year)
          .maybeSingle();

        if (existing) {
          // Update the link
          const { error: updateError } = await supabase
            .from('filings_10k')
            .update({ link: secUrl })
            .eq('id', existing.id);
          
          if (updateError) {
            console.log(`⚠️ Error updating ${builder.ticker} FY${filing.fiscal_year}:`, updateError.message);
          } else {
            skipped++;
            console.log(`✅ Updated ${builder.ticker} FY${filing.fiscal_year}`);
          }
          continue;
        }

        const { error: insertError } = await supabase
          .from('filings_10k')
          .insert({
            builder_id: builder.id,
            filing_date: filing.filing_date,
            fiscal_year: filing.fiscal_year,
            link: secUrl,
          });

        if (insertError) {
          console.error(`❌ Error inserting ${builder.ticker} FY${filing.fiscal_year}:`, insertError);
        } else {
          inserted++;
          console.log(`✅ Added ${builder.ticker} FY${filing.fiscal_year}`);
        }
      }
    }

    console.log(`\n📊 Done: ${inserted} inserted, ${skipped} skipped`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

populateFilings();
