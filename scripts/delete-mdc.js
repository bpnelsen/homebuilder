require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteMDC() {
  console.log('🗑️  Deleting MDC from database...');
  
  // Delete MDC from builders
  const { error } = await supabase.from('builders').delete().eq('ticker', 'MDC');
  if (error) {
    console.log('Error deleting MDC:', error.message);
  } else {
    console.log('✓ Deleted MDC from builders table');
  }
  
  console.log('✅ Done!');
}

deleteMDC();
