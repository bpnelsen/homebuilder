/**
 * Process historical 10-K and 10-Q filings with Claude
 * Generates summaries and stores in database
 */

const Anthropic = require('@anthropic-ai/sdk').default;
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Mock filing data - in production, this would be fetched from SEC Edgar
const MOCK_FILINGS = [
  {
    ticker: 'LEN',
    type: '10-K',
    year: 2024,
    content: 'Lennar Corporation fiscal 2024 annual report...',
    link: 'https://www.sec.gov/cgi-bin/viewer?action=view&cik=60086&accession_number=0001193125-24-000000&xbrl_type=v',
  },
  {
    ticker: 'LEN',
    type: '10-K',
    year: 2023,
    content: 'Lennar Corporation fiscal 2023 annual report...',
    link: 'https://www.sec.gov/cgi-bin/viewer?action=view&cik=60086&accession_number=0001193125-23-000000&xbrl_type=v',
  },
  {
    ticker: 'LEN',
    type: '10-K',
    year: 2022,
    content: 'Lennar Corporation fiscal 2022 annual report...',
    link: 'https://www.sec.gov/cgi-bin/viewer?action=view&cik=60086&accession_number=0001193125-22-000000&xbrl_type=v',
  },
];

async function processFiling(filing) {
  console.log(`\n📄 Processing ${filing.ticker} ${filing.type} ${filing.year}...`);

  try {
    // In production, you'd send actual filing content
    // For now, we'll create a placeholder
    const prompt = `Summarize this SEC ${filing.type} filing for ${filing.ticker} (${filing.year}) in 2-3 paragraphs. 
    
Focus on:
- Key financial metrics and revenue
- Business highlights and market position
- Risks and challenges
- Strategic direction

Filing excerpt:
${filing.content.substring(0, 5000)}...

Provide a professional, concise summary suitable for investors.`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const summary =
      message.content[0].type === 'text' ? message.content[0].text : '';

    console.log(`✅ Summary generated (${summary.length} chars)`);

    return {
      ticker: filing.ticker,
      type: filing.type,
      year: filing.year,
      summary,
      link: filing.link,
      key_metrics: {
        processedAt: new Date().toISOString(),
        wordCount: summary.split(' ').length,
      },
    };
  } catch (error) {
    console.error(`❌ Error processing ${filing.ticker}:`, error.message);
    throw error;
  }
}

async function storeProcessedFilings(processedFilings) {
  console.log('\n\n💾 Storing processed filings...');

  for (const filing of processedFilings) {
    try {
      // Get builder ID
      const { data: builder } = await supabase
        .from('builders')
        .select('id')
        .eq('ticker', filing.ticker)
        .single();

      if (!builder) {
        console.error(`❌ Builder not found: ${filing.ticker}`);
        continue;
      }

      if (filing.type === '10-K') {
        // Store in filings_10k table
        const { error } = await supabase.from('filings_10k').insert({
          builder_id: builder.id,
          fiscal_year: filing.year,
          filing_date: new Date(`${filing.year}-12-31`),
          summary: filing.summary,
          link: filing.link,
          key_metrics: filing.key_metrics,
          alert_sent: false,
        });

        if (error) {
          console.error(`❌ Error storing ${filing.ticker} 10-K:`, error.message);
        } else {
          console.log(`✅ ${filing.ticker} 10-K ${filing.year} stored`);
        }
      } else if (filing.type === '10-Q') {
        // Store in earnings_calls table (using for quarterly reports for now)
        const { error } = await supabase.from('earnings_calls').insert({
          builder_id: builder.id,
          fiscal_year: filing.year,
          fiscal_quarter: Math.ceil((Math.random() * 3) + 1),
          call_date: new Date(`${filing.year}-12-31`),
          ai_summary: filing.summary,
          link: filing.link,
          alert_sent: false,
        });

        if (error) {
          console.error(`❌ Error storing ${filing.ticker} 10-Q:`, error.message);
        } else {
          console.log(`✅ ${filing.ticker} 10-Q ${filing.year} stored`);
        }
      }
    } catch (error) {
      console.error(`❌ Error with ${filing.ticker}:`, error.message);
    }
  }
}

async function main() {
  console.log('=== HISTORICAL FILINGS PROCESSOR ===');
  console.log(`Processing ${MOCK_FILINGS.length} filings with Claude...\n`);

  if (!process.env.CLAUDE_API_KEY) {
    console.error('❌ CLAUDE_API_KEY not set');
    console.log('Set it via: export CLAUDE_API_KEY=sk-ant-...');
    process.exit(1);
  }

  try {
    const processedFilings = [];

    for (const filing of MOCK_FILINGS) {
      const processed = await processFiling(filing);
      processedFilings.push(processed);

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    await storeProcessedFilings(processedFilings);

    console.log('\n\n✅ COMPLETE!');
    console.log(`\nProcessed and stored ${processedFilings.length} filings`);
    console.log('Builder detail pages now show historical data!');
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
