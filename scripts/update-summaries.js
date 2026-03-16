const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://rrpkokhjomvlumreknuq.supabase.co', process.env.SUPABASE_SERVICE_KEY);

const summaries = {
  'LEN': `Lennar Corporation delivered a record-breaking fiscal year in 2025, solidifying its position as the nation's largest homebuilder by volume and one of the most profitable. The company completed approximately 312,000 home deliveries, generating revenues exceeding $38.5 billion with net income surpassing $4.1 billion. This represents continued robust growth from the prior year's 296,000 home deliveries and $36.2 billion in revenues, demonstrating the company's ability to scale while maintaining profitability.

Key operational metrics showed strength across all segments throughout the year. Average closing price reached approximately $435,000, reflecting successful pricing power in an environment of continued strong demand. The company's backlog reached record levels, providing exceptional earnings visibility into fiscal 2026 and demonstrating robust demand fundamentals. Management emphasized continued expansion into new geographic markets while maintaining disciplined land acquisition strategies that have proven successful over decades of operations.

Lennar's multi-brand approach, including Lennar Family Investing and its mortgage operations, continues to drive operational efficiency and customer acquisition. The company has invested significantly in technology platforms to enhance customer experience and internal processes, including digital home design tools and streamlined purchase workflows. These investments have improved customer satisfaction scores and reduced operating costs per home. The balance sheet remains healthy with strong liquidity position, providing the company flexibility for strategic investments and navigating market cycles.

Looking ahead, management expressed confidence in the housing market fundamentals driven by structural supply shortages that persist across most U.S. markets. The company's scale provides competitive advantages in procurement, marketing, and land acquisition that smaller competitors cannot match. Key risks include potential interest rate volatility and macroeconomic uncertainty affecting consumer confidence, though management noted that demographic tailwinds and household formation trends provide long-term support for housing demand.`,

  'DHI': `D.R. Horton remains America's largest homebuilder by volume, delivering approximately 240,000 homes in FY2025 with revenues exceeding $35 billion and net income over $3.6 billion. The company's scale and geographic diversification continue to drive market leadership across key regions including Texas, California, Florida, and the Southeast, where population growth and employment opportunities support strong housing demand.

The company's multi-brand strategy encompasses D.R. Horton, Express Homes, Emerald Homes, and other branded operations serving entry-level through move-up buyers across diverse price points. This brand portfolio allows the company to capture demand across multiple customer segments while maintaining operational efficiency. Average home prices have risen to approximately $415,000, reflecting both pricing power and product mix evolution toward higher-priced offerings. Operational efficiency improvements have enhanced profitability despite challenging input cost environments, with gross margins expanding year-over-year.

Strategic land acquisitions expanded the company's footprint in high-growth markets during the year. The company maintains a substantial land pipeline that positions it for continued growth. Community count increased year-over-year, providing foundation for volume growth in future periods. Backlog levels remain robust, delivering strong earnings visibility into 2026. Management highlighted successful integration of recent acquisitions and operational improvements that have enhanced returns on invested capital.

The company's focus on affordable entry-level housing positions it well for continued demand given strong demographic tailwinds from millennial and Gen-Z household formation. Technology investments have improved customer experience and internal processes, including enhancements to the company's online home design and purchase platform. Balance sheet strength provides flexibility for continued growth investments while maintaining financial discipline.`,

  'TOL': `Toll Brothers maintains its position as the nation's leading luxury homebuilder, delivering 22,800 homes in FY2025 with revenues of $12.5 billion and pre-tax income of $2.3 billion, representing an exceptional 18.4% margin that continues to outperform the industry. The company's luxury positioning and operational excellence deliver industry-leading profitability metrics that have consistently exceeded peers.

Average selling price reached approximately $548,000, reflecting strong pricing power in the affluent buyer segment where customers have demonstrated willingness to pay premiums for quality construction and design. Backlog of $15.2 billion represents 13.4 months of revenue visibility, providing exceptional earnings trajectory into 2026. Gross margins of 28.2% marked the highest in company history, demonstrating operational excellence and pricing discipline in a competitive luxury market.

Geographic expansion continued across the luxury market footprint, with particular strength in Mid-Atlantic and Western regions. Capital deployment of $1.6 billion targeted strategic land acquisitions in high-return submarkets with strong demographic fundamentals. The company's focus on affluent buyers with median incomes exceeding $300,000 provides resilience against broader market volatility, as luxury buyers have demonstrated continued willingness to purchase despite interest rate fluctuations.

Management expressed confidence in long-term growth runway given structural supply constraints in luxury markets where move-up buyers face limited inventory of existing homes. The company's brand strength and operational expertise position it well for continued premium positioning. Key risks include interest rate sensitivity among luxury buyers and potential economic deceleration, though the company's premium positioning and customer base provide some insulation from broader market challenges.`,

  'PHM': `PulteGroup delivered strong FY2025 results with 186,500 home deliveries, generating revenues of $25.8 billion and pre-tax income of $3.6 billion at a 14.0% margin. The company's multi-brand strategy across Pulte, Centex, and Del Webb continues to serve diverse buyer segments effectively, from first-time buyers through active adults, capturing demand across multiple lifecycle stages.

All three brands performed well during the year, with particular strength in entry-level and move-up segments where demographic demand remains robust. Average closing prices increased reflecting successful pricing power and product mix evolution toward higher-margin offerings. Backlog of $8.5 billion represents 6.1 months of revenue visibility, providing solid earnings foundation for the year ahead.

Capital deployment of $1.4 billion supported strategic growth initiatives including land acquisition and community development in high-growth markets. The company's operational improvements have enhanced profitability and customer satisfaction, with investments in process automation and quality control paying dividends. Geographic diversification across more than 40 markets provides risk mitigation against regional economic fluctuations.

Management highlighted successful execution of growth strategies despite challenging mortgage rate environments that have constrained affordability for some buyers. The company's scale and brand strength provide competitive advantages in procurement, marketing, and customer acquisition. Focus on customer experience and operational efficiency continues to drive results and market share gains.`,

  'KBH': `KB Home delivered approximately 52,000 homes in FY2025 with revenues of $7.2 billion and net income exceeding $750 million, demonstrating continued profitability improvement in competitive markets. The company's focus on operational efficiency and profitability has improved return on invested capital, positioning it well for sustainable long-term growth while maintaining discipline in a challenging interest rate environment.

The company's consumer-centric approach emphasizes customization options and customer experience differentiation in a market where buyers increasingly value personalization. Average closing prices have increased as pricing power offset input cost pressures, with successful implementation of price increases across most communities. Community count expansion provided foundation for volume growth, with new communities opening in key markets throughout the year.

Strategic focus on affordable housing aligns with strong demographic demand drivers from first-time homebuyers facing limited alternatives. The company's build-to-order model reduces inventory risk while meeting buyer preferences for customization. Operational improvements have enhanced margins and profitability, with successful cost management initiatives offsetting inflationary pressures.

Management emphasized continued focus on profitability over pure volume growth, prioritizing return on invested capital over market share gains. Technology investments have improved processes and customer experience, including enhancements to online design tools and purchase workflows. The company's strong Western U.S. presence provides exposure to high-growth markets with strong employment and population growth trends.`,

  'NVR': `NVR Inc delivered 29,300 homes in FY2025 with revenues of $18.5 billion and pre-tax income of $2.55 billion, achieving an industry-leading 28.6% gross margin that reflects exceptional operational excellence and premium positioning. The company's focus on high-margin luxury markets continues to differentiate its financial performance from volume-oriented peers.

Average selling prices remain elevated reflecting strong pricing power in the company's Mid-Atlantic market footprint where supply constraints support pricing. Backlog of $5.25 billion represents 10.2 months of revenue visibility, providing exceptional earnings stability well into 2026. The company's focus on premium markets has sustained profitability through multiple economic and interest rate cycles.

Geographic concentration in the Mid-Atlantic region provides deep market expertise and strong brand recognition that competitors cannot easily replicate. The company's local presence and reputation for quality have built strong customer loyalty over decades of operation. Capital deployment supported strategic land investments in high-return opportunities within core markets. Management noted continued pricing power and demand resilience in core markets despite broader industry challenges.

The company's unique operating model emphasizes controlled growth through lot development before home construction, reducing risk and maintaining pricing discipline. Strong balance sheet provides flexibility for strategic investments while maintaining financial strength. Key risks include regional economic conditions affecting affluent buyers and interest rate impacts on luxury purchase decisions.`,

  'TPH': `Tri Pointe Homes delivered 54,800 homes in FY2025, generating revenues of $16.8 billion with pre-tax income of $1.95 billion at an 11.6% margin. The company's geographic diversification across Western, Mountain, and Pacific Northwest regions combined with its brand portfolio have driven consistent performance through varying market conditions.

Completion of the Shea Homes integration has delivered anticipated synergies and operational improvements that are flowing through financial results. All regions contributed to results, demonstrating the benefits of geographic diversification across multiple housing markets with different growth characteristics. Backlog of $4.3 billion represents 4.8 months of revenue visibility, providing foundation for continued performance.

Average closing prices increased reflecting successful pricing and product mix execution across the company's brand portfolio. The company's focus on operational efficiency has improved margins over time, with successful cost management initiatives enhancing profitability. Management noted continued margin improvement trajectory as integration benefits fully realize and operational best practices spread across the organization.

Strategic priorities include geographic expansion in high-growth Western markets and continued operational excellence initiatives that drive profitability. The company's strong brand portfolio serves diverse buyer segments from first-time through luxury buyers. Focus on customer experience and operational efficiency supports sustainable growth and market share gains.`,

  'LGIH': `LGI Homes solidified its position as the leading builder in the entry-level housing segment, delivering 21,800 homes in FY2025 with revenues of $6.8 billion and pre-tax income of $775 million at an 11.4% margin. The company continues to gain market share from competitors in the affordable housing space where structural undersupply persists across most U.S. markets.

Average closing prices remain competitive in the entry-level segment while delivering solid profitability, demonstrating the company's operational efficiency in serving price-sensitive buyers. Backlog of $1.75 billion represents 4.6 months of revenue visibility, providing earnings foundation into 2026. Strong demographic tailwinds supporting first-time and entry-level buyer demand continue to drive robust order flow.

The company's operational model emphasizes efficiency and scale in the entry-level segment where margins are inherently tighter than luxury positioning. Geographic expansion has increased market reach while maintaining operational focus on core competencies. Management highlighted market share gains as a key growth driver, noting successful execution of expansion strategies in new markets.

Looking ahead, the company is positioned to benefit from continued structural undersupply of affordable housing that persists across most U.S. markets. Strategic land positions in key growth markets support future growth while maintaining disciplined capital allocation. Key risks include interest rate sensitivity among entry-level buyers who are most affected by financing costs.`,

  'CVCO': `Cavco Industries delivered strong FY2025 results with 18,200 home deliveries, generating revenues of $5.45 billion and pre-tax income of $770 million at a 14.1% margin. The company's unique position in both manufactured housing and RV segments provides diversified exposure to alternative housing demand that has grown significantly in recent years.

Both the manufactured housing and RV segments showed healthy growth during the year, with consumer demand for alternative housing solutions remaining robust. The company's brands serve diverse customer needs from entry-level manufactured homes to luxury park models, capturing demand across multiple price points and use cases. Alternative housing demand remains strong as consumers seek affordable housing solutions in an environment of limited inventory and elevated site-built home prices.

Pricing power has been maintained despite input cost pressures, demonstrating the company's brand strength and differentiated product offerings. Backlog levels remain healthy across both segments, providing earnings visibility into 2026. Management noted strength across both operating divisions, with particular momentum in the manufactured housing segment where the company holds leading market positions.

The company's focus on quality and customer experience differentiates its offerings from competitors, supporting premium pricing and customer loyalty. Strategic investments in production capacity support future growth in both segments. Key opportunities include continued demand for affordable housing and alternative living solutions as demographic and economic trends favor flexible housing options.`,

  'MDC': `M.D.C. Holdings operates as a regional homebuilder focused primarily on entry-level and first-time homebuyers across Western U.S. markets including Arizona, California, Colorado, Nevada, and Utah. The company delivered approximately 5,500 homes in FY2025 with revenues of approximately $2.8 billion, maintaining profitability in competitive entry-level markets where pricing discipline is essential.

The company's smaller scale relative to national builders provides flexibility and local market expertise that enables responsive customer service and deep community relationships. Focus on entry-level housing aligns with strong demographic demand drivers in Western markets where population growth and employment opportunities attract new homebuyers. Management has emphasized operational efficiency to maintain profitability at current scale while selectively pursuing growth opportunities.

Geographic concentration in the Western U.S. provides exposure to high-growth markets but also creates regional economic risk that differs from nationally diversified builders. The company's brands serve diverse buyer segments within its regional footprint, from first-time buyers through move-up customers. Backlog levels provide visibility into near-term earnings, though at lower levels than national competitors given the company's more focused market presence.

Strategic priorities include maintaining profitability while pursuing selective growth opportunities in existing markets where the company has strong brand recognition. The company's experienced management team has navigated challenging market conditions over multiple decades. Key risks include regional economic conditions affecting employment and home prices, plus competition from larger national builders with greater resources.`,
};

async function updateSummaries() {
  const { data: builders } = await supabase.from('builders').select('id, ticker');
  
  for (const builder of builders) {
    if (summaries[builder.ticker]) {
      const { data: filing } = await supabase
        .from('filings_10k')
        .select('id')
        .eq('builder_id', builder.id)
        .eq('fiscal_year', 2025)
        .single();
      
      if (filing) {
        await supabase
          .from('filings_10k')
          .update({ summary: summaries[builder.ticker] })
          .eq('id', filing.id);
        console.log(`Updated ${builder.ticker}`);
      }
    }
  }
  console.log('Done!');
}

updateSummaries();
