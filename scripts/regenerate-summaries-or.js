#!/usr/bin/env node
/**
 * Regenerate 10-K Summaries using Claude Sonnet 4.6 via OpenRouter
 * With HTML/XBRL stripping for clean summaries
 */

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rrpkokhjomvlumreknuq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycGtva2hqb212bHVtcmVrbnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkwOTU5MSwiZXhwIjoyMDg3NDg1NTkxfQ.kFTdS-I7SnPPkgqYu0amlzLQgnGJppb4ZKkfIyCy0JA';
const openRouterApiKey = process.env.OPENROUTER_API_KEY;

if (!openRouterApiKey) {
  console.error('❌ Missing OPENROUTER_API_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Strip HTML and XBRL tags to get clean text
function cleanHtml(html) {
  return html
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // Remove script and style tags
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    // Remove all HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Remove XBRL tags (anything that looks like xbrl)
    .replace(/http:\/\/fasb\.org[^\s]+/g, ' ')
    .replace(/https:\/\/fasb\.org[^\s]+/g, ' ')
    // Clean up entity references
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&#x[0-9a-f]+;/gi, ' ')
    .replace(/&\#[0-9]+;/gi, ' ')
    // Remove multiple whitespace
    .replace(/\s+/g, ' ')
    // Remove page breaks and form fields
    .replace(/(__|##)/g, ' ')
    .trim();
}

console.log('🔄 Starting 10-K summary regeneration (cleaned HTML)...\n');

async function callClaude(prompt) {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'anthropic/claude-sonnet-4.6',
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
}

async function generateSummary(companyName, fiscalYear, filingContent) {
  // Clean the HTML content first
  const cleanContent = cleanHtml(filingContent);
  
  const prompt = `You are a financial analyst. Analyze this 10-K filing for ${companyName} (FY${fiscalYear}) and provide:

1. A 2-3 paragraph executive summary (clean business language, no technical tags)
2. Key financial metrics in JSON format
3. 3-5 business headwinds (challenges/risks)
4. 3-5 business tailwinds (opportunities)
5. Geographic markets they operate in

Return ONLY valid JSON (no markdown code blocks):
{"summary": "...", "keyMetrics": {"revenue": "$X billion", "netIncome": "$X billion"}, "headwinds": ["..."], "tailwinds": ["..."], "markets": ["..."]}

10-K CONTENT (cleaned):
${cleanContent.substring(0, 8000)}`;

  const result = await callClaude(prompt);
  
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('⚠️ JSON parse failed');
  }
  return { summary: result, keyMetrics: {}, headwinds: [], tailwinds: [], markets: [] };
}

async function regenerateSummaries() {
  // Get filings with builder info
  const { data: builders } = await supabase.from('builders').select('id, ticker, name');
  const builderMap = {};
  builders.forEach(b => builderMap[b.id] = b);

  const { data: filings, error } = await supabase
    .from('filings_10k')
    .select('id, builder_id, fiscal_year, link')
    .order('fiscal_year', { ascending: false });

  if (error) {
    console.error('❌ Error fetching filings:', error);
    return;
  }

  console.log(`📋 Found ${filings.length} filings to process\n`);

  for (const filing of filings) {
    const { id, builder_id, fiscal_year, link } = filing;
    const builder = builderMap[builder_id];
    if (!builder) continue;
    
    const ticker = builder.ticker;
    const companyName = builder.name;
    
    console.log(`📄 Processing ${ticker} FY${fiscal_year}...`);
    
    try {
      const response = await axios.get(link, { 
        timeout: 30000,
        headers: { 'User-Agent': 'HomebuilderResearch/1.0' }
      });
      
      const result = await generateSummary(companyName, fiscal_year, response.data);
      
      await supabase.from('filings_10k').update({
        summary: result.summary,
        key_metrics: result.keyMetrics,
      }).eq('id', id);

      console.log(`✅ ${ticker} FY${fiscal_year} updated`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
    }
    
    await new Promise(r => setTimeout(r, 2500));
  }
  
  console.log('\n✅ Summary regeneration complete!');
}

regenerateSummaries();
