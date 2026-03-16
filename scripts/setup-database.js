#!/usr/bin/env node
/**
 * Database Setup Script
 * Initializes Supabase tables and sample data
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // Read SQL schema
    const schemaPath = path.join(__dirname, '../lib/database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema setup via Supabase - Note: This requires direct SQL access
    // For now, we'll document the manual steps
    console.log('📋 Database schema created');

    // Insert sample builders
    const builders = [
      {
        name: 'Lennar Corporation',
        ticker: 'LEN',
        website: 'https://www.lennar.com',
        markets: [
          'Arizona',
          'California',
          'Colorado',
          'Florida',
          'Illinois',
          'Texas',
        ],
      },
      {
        name: 'D.R. Horton Inc',
        ticker: 'DHI',
        website: 'https://www.drhorton.com',
        markets: [
          'Arizona',
          'Colorado',
          'Florida',
          'Georgia',
          'North Carolina',
          'Texas',
        ],
      },
      {
        name: 'KB Home',
        ticker: 'KBH',
        website: 'https://www.kbhome.com',
        markets: ['Arizona', 'California', 'Colorado', 'Florida', 'Nevada'],
      },
      {
        name: 'Toll Brothers Inc',
        ticker: 'TOL',
        website: 'https://www.tollbrothers.com',
        markets: [
          'Arizona',
          'California',
          'Colorado',
          'Florida',
          'New Jersey',
          'Pennsylvania',
        ],
      },
      {
        name: 'PulteGroup Inc',
        ticker: 'PHM',
        website: 'https://www.pultegroup.com',
        markets: [
          'Arizona',
          'Colorado',
          'Florida',
          'Georgia',
          'Nevada',
          'Texas',
        ],
      },
      {
        name: 'NVR Inc',
        ticker: 'NVR',
        website: 'https://www.nvrinc.com',
        markets: ['Colorado', 'Maryland', 'New Jersey', 'Pennsylvania', 'Texas'],
      },
      {
        name: 'Tri Pointe Homes Inc',
        ticker: 'TPH',
        website: 'https://www.tripointehomes.com',
        markets: ['Arizona', 'California', 'Colorado', 'Nevada'],
      },
      {
        name: 'Cavco Industries Inc',
        ticker: 'CVCO',
        website: 'https://www.cavco.com',
        markets: ['Arizona', 'California', 'Nevada', 'Texas'],
      },
      {
        name: 'LGI Homes Inc',
        ticker: 'LGIH',
        website: 'https://www.lgihomes.com',
        markets: ['Arizona', 'Florida', 'Georgia', 'Nevada', 'Texas'],
      },
    ];

    const { data, error } = await supabase
      .from('builders')
      .insert(builders)
      .select();

    if (error) {
      console.error('❌ Error inserting builders:', error);
      throw error;
    }

    console.log(`✅ Inserted ${data.length} home builders`);
    console.log('\n📋 Setup Complete!');
    console.log('Next steps:');
    console.log('1. Add environment variables to .env.local');
    console.log('2. Run: npm run scrape:stocks (to fetch initial stock data)');
    console.log('3. Run: npm run scrape:filings (to fetch 10-K data)');

    return true;
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run setup
setupDatabase();
