#!/usr/bin/env node
/**
 * Regenerate only FY2022 10-K Summaries
 */

const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rrpkokhjomvlumreknuq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycGtva2hqb212bHVtcmVrbnVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkwOTU5MSwiZXhwIjoyMDg3NDg1NTkxfQ.kFTdS-I7SnPPkgqYu0amlzLQgnGJppb4ZKkfIyCy0JA';
const openRouterApiKey = process.env.OPENROUTER_API_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

function cleanHtml(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/http:\/\/fasb\.org[^\s]+/g, ' ')
    .replace(/https:\/\/fasb\.org[^\s]+/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/&#x[0-9a-f]+;/gi, ' ')
    .replace(/&\#[0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/(__|##)/g, ' ')
    .trim();
}

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
  const cleanContent = cleanHtml(filingContent);
  
  const prompt = `You are a professional financial analyst. Analyze this 10-K filing for ${companyName} (FY${fiscalYear}) and provide a clean executive summary.

Requirements:
1. 2-3 paragraph executive summary (professional business language, no technical tags)
2. Key financial metrics in JSON
3. 3-5 business headwinds (challenges/risks)
4. 3-5 business tailwinds (opportunities)
5. Geographic markets

Return ONLY valid JSON (no markdown):
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

async function regenerate() {
  // Get FY2022 filings with builder info
  const { data: builders } = await supabase.from('builders').select('id, ticker, name');
  const builderMap = {};
  builders.forEach(b => builderMap[b.id] = b);

  const { data: filings } = await supabase
    .from('filings_10k')
    .select('id, builder_id, fiscal_year, link')
    .eq('fiscal_year', '2022');

  console.log(`🔄 Regenerating ${filings.length} FY2022 filings...\n`);

  for (const filing of filings) {
    const { id, builder_id, fiscal_year, link } = filing;
    const builder = builderMap[builder_id];
    if (!builder) continue;
    
    console.log(`📄 Processing ${builder.ticker} FY2022...`);
    
    try {
      const response = await axios.get(link, { 
        timeout: 30000,
        headers: { 'User-Agent': 'HomebuilderResearch/1.0' }
      });
      
      const result = await generateSummary(builder.name, fiscal_year, response.data);
      
      await supabase.from('filings_10k').update({
        summary: result.summary,
        key_metrics: result.keyMetrics,
      }).eq('id', id);

      console.log(`✅ ${builder.ticker} FY2022 updated`);
    } catch (err) {
      console.error(`❌ Error: ${err.message}`);
    }
    
    await new Promise(r => setTimeout(r, 2500));
  }
  
  console.log('\n✅ FY2022 regeneration complete!');
}

regenerate();
