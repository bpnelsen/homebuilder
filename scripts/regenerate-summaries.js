#!/usr/bin/env node
/**
 * Regenerate 10-K Summaries using Claude Sonnet 4.6 via OpenRouter
 */

require('dotenv').config();
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const openRouterApiKey = process.env.OPENROUTER_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

if (!openRouterApiKey) {
  console.error('❌ Missing OPENROUTER_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Call Claude via OpenRouter
async function callClaude(prompt) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'anthropic/claude-sonnet-4-20250619',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://homebuilder.app',
          'X-Title': 'Homebuilder 10-K Summary',
        },
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Claude API error:', error.response?.data || error.message);
    throw error;
  }
}

// Generate clean summary
async function generateSummary(companyName, fiscalYear, filingContent) {
  const prompt = `You are a financial analyst. Analyze this 10-K filing for ${companyName} (FY${fiscalYear}) and provide:

1. A 2-3 paragraph executive summary of key business highlights (clean text, no XBRL/HTML)
2. Key financial metrics in JSON format
3. Major business headwinds (challenges, risks) - 3-5 bullet points
4. Business tailwinds (opportunities, growth drivers) - 3-5 bullet points
5. Geographic markets they operate in

Return ONLY valid JSON (no other text):
{
  "summary": "Executive summary paragraph...",
  "keyMetrics": { "revenue": "X billion", "netIncome": "X billion", "margins": "X%" },
  "headwinds": ["headwind 1", "headwind 2", "headwind 3"],
  "tailwinds": ["tailwind 1", "tailwind 2", "tailwind 3"],
  "markets": ["Texas", "Arizona", "Florida"]
}

10-K CONTENT (first 8000 chars):
${filingContent.substring(0, 8000)}`;

  const result = await callClaude(prompt);
  
  // Parse JSON from response
  try {
    // Handle if response has markdown code blocks
    const jsonMatch = result.match(/```json\n?([\s\S]*?)\n?```/) || result.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : result;
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('⚠️ Failed to parse JSON, using raw response');
    return { summary: result, keyMetrics: {}, headwinds: [], tailwinds: [], markets: [] };
  }
}

async function regenerateSummaries() {
  console.log('🔄 Starting 10-K summary regeneration...\n');
  
  // Get all filings
  const { data: filings, error } = await supabase
    .from('filings_10k')
    .select('id, fiscal_year, filing_url, builders(ticker, company_name)')
    .order('fiscal_year', { ascending: false });

  if (error) {
    console.error('❌ Error fetching filings:', error);
    return;
  }

  console.log(`📋 Found ${filings.length} filings to process\n`);

  for (const filing of filings) {
    const { id, fiscal_year, filing_url, builders } = filing;
    const ticker = builders.ticker;
    const companyName = builders.company_name;
    
    console.log(`📄 Processing ${ticker} FY${fiscal_year}...`);
    
    try {
      // Fetch the filing content
      const response = await axios.get(filing_url, { 
        timeout: 30000,
        headers: { 'User-Agent': 'HomebuilderResearch/1.0' }
      });
      
      const content = response.data;
      
      // Generate summary
      const result = await generateSummary(companyName, fiscal_year, content);
      
      // Update database
      const { error: updateError } = await supabase
        .from('filings_10k')
        .update({
          summary: result.summary,
          key_metrics: result.keyMetrics,
          headwinds: result.headwinds,
          tailwinds: result.tailwinds,
          markets: result.markets,
        })
        .eq('id', id);

      if (updateError) {
        console.error(`❌ Update error for ${ticker}:`, updateError);
      } else {
        console.log(`✅ ${ticker} FY${fiscal_year} updated`);
      }
      
    } catch (err) {
      console.error(`❌ Error processing ${ticker}:`, err.message);
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('\n✅ Summary regeneration complete!');
}

regenerateSummaries();
