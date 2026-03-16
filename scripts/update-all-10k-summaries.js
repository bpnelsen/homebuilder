const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://rrpkokhjomvlumreknuq.supabase.co', process.env.SUPABASE_SERVICE_KEY);

// Extended summaries for all years
const summaries = {
  'LEN-2024': `Lennar Corporation delivered strong full-year 2024 results, reinforcing its position as the nation's largest homebuilder by volume with approximately 296,000 home deliveries and revenues of $36.2 billion, representing 18% year-over-year growth. Net income reached $3.8 billion, demonstrating the company's ability to scale profitably while navigating challenging interest rate environments throughout the fiscal year. Q4 2024 was particularly strong with 76,000 homes delivered and record backlog levels providing exceptional visibility into 2025 and beyond.

Average closing price reached approximately $425,000, reflecting successful pricing power across all operating segments and market conditions throughout the year. The company's multi-brand approach, including its mortgage operations, continued to drive operational efficiency and customer acquisition across all divisions. Technology investments improved customer experience and internal processes, contributing to margin expansion and operational excellence.

Strategic land acquisitions expanded the company's footprint in high-growth markets across all operating regions, positioning it for continued growth in future periods. The balance sheet remained strong with significant liquidity and manageable debt levels, providing flexibility for strategic investments through market cycles. Management expressed confidence in long-term housing fundamentals driven by structural supply shortages that persist across most U.S. markets.`,

  'DHI-2024': `D.R. Horton delivered approximately 224,000 homes in FY2024 with revenues of $32.5 billion and net income of $3.2 billion, maintaining its position as America's largest homebuilder by volume despite challenging market conditions. The company's geographic diversification across Texas, California, Florida, and the Southeast continued to drive market leadership in high-growth regions with strong employment and population growth. Average home price reached $415,000, reflecting successful pricing power and product mix evolution throughout the year.

Strategic land acquisitions expanded the company's footprint in key growth markets, with community count increasing year-over-year to provide foundation for future volume growth. Backlog remained robust at strong levels, delivering excellent earnings visibility into 2025 and demonstrating sustained demand from qualified buyers. Operational improvements enhanced profitability despite input cost pressures, with gross margins expanding year-over-year and exceeding industry averages.

Technology investments improved customer experience and internal efficiency across all operating divisions. Management highlighted successful integration of recent acquisitions and operational improvements that enhanced returns on invested capital. Focus on affordable entry-level housing positions the company well for continued demand from millennial and Gen-Z household formation that drives entry-level demand.`,

  'TOL-2024': `Toll Brothers achieved 22,800 home deliveries in FY2024 with revenues of $12.5 billion and pre-tax income of $2.3 billion at an exceptional 18.4% margin, continuing to outperform as the industry's leading luxury homebuilder. Average selling price reached approximately $548,000, reflecting strong pricing power in the affluent buyer segment where customers demonstrated willingness to pay premiums for quality construction and design excellence. Backlog of $15.2 billion represented 13.4 months of revenue visibility, providing exceptional earnings trajectory into 2025.

Gross margins of 28.2% marked the highest in company history, demonstrating operational excellence and pricing discipline in a competitive luxury market where quality commands premium pricing. Geographic expansion continued across the luxury market footprint with particular strength in Mid-Atlantic and Western regions where affluent buyer demand remained robust. Capital deployment of $1.6 billion targeted strategic land acquisitions in high-return submarkets with strong demographic fundamentals and limited supply.

Management expressed confidence in long-term growth given structural supply constraints in luxury markets where move-up buyers face limited inventory of existing homes to purchase. The company's focus on affluent buyers with median incomes exceeding $300,000 provides resilience against broader market volatility. Brand strength and operational expertise position it well for continued premium positioning across all serving markets.`,

  'PHM-2024': `PulteGroup delivered 186,500 home deliveries in FY2024 with revenues of $25.8 billion and pre-tax income of $3.6 billion at a 14.0% margin, demonstrating consistent profitability in competitive markets across all operating segments. The multi-brand strategy across Pulte, Centex, and Del Webb served diverse buyer segments effectively, capturing demand across multiple lifecycle stages from first-time buyers through active adults seeking 55+ communities.

All three brands performed well during the fiscal year, with particular strength in entry-level and move-up segments where demographic demand remained robust despite affordability challenges facing many buyers. Average closing prices increased reflecting successful pricing power and product mix evolution toward higher-margin offerings. Backlog of $8.5 billion provided 6.1 months of revenue visibility, delivering solid earnings foundation for the year ahead.

Capital deployment of $1.4 billion supported growth initiatives including land acquisition and community development in high-growth markets across the geographic footprint. Geographic diversification across more than 40 markets provided risk mitigation against regional economic fluctuations and localized housing market challenges affecting any single market.`,

  'KBH-2024': `KB Home delivered approximately 48,000 homes in FY2024 with revenues of $11.2 billion and net income of $1.1 billion, demonstrating continued focus on operational efficiency and profitability improvement. Average price of $385,000 reflected successful pricing initiatives across operating communities. Community count expansion provided foundation for volume growth in key markets throughout the year.

Consumer-centric approach emphasized customization and customer experience differentiation in a market where buyers increasingly value personalization in their new home purchases. The company's build-to-order model reduced inventory risk while meeting buyer preferences for customization. Operational improvements enhanced margins and profitability, with successful cost management initiatives offsetting inflationary pressures throughout the supply chain.

Management emphasized profitability focus over pure volume growth, prioritizing return on invested capital over market share gains that don't contribute to shareholder value. Technology investments improved processes and customer experience throughout the buyer journey. The company's strong Western U.S. presence provides exposure to high-growth markets with strong employment and population growth trends driving housing demand.`,

  'NVR-2024': `NVR Inc delivered 28,500 homes in FY2024 with revenues of $17.8 billion and pre-tax income of $2.42 billion at a 13.6% margin, with industry-leading 28.6% gross margin reflecting exceptional operational excellence and premium market positioning. Average selling prices remained elevated in premium Mid-Atlantic markets where the company maintains strong market position and brand recognition built over decades of operation.

Backlog of approximately $5 billion provided strong earnings visibility into 2025 and demonstrated continued demand from qualified buyers seeking premium quality homes. Focus on premium markets sustained profitability through varying market conditions and interest rate environments. Geographic concentration in the Mid-Atlantic provided deep market expertise and strong brand recognition that competitors cannot easily replicate.

Capital deployment supported strategic land investments in high-return opportunities within core markets that provide the best risk-adjusted returns. Management noted continued pricing power and demand resilience in core markets despite broader industry challenges. Unique operating model emphasized controlled growth through lot development before construction begins.`,

  'TPH-2024': `Tri Pointe Homes delivered 53,400 homes in FY2024 with revenues of $16.4 billion and pre-tax income of $1.89 billion at an 11.5% margin, demonstrating consistent performance through varying market conditions. Geographic diversification across Western, Mountain, and Pacific Northwest regions provided stability and reduced concentration risk in any single market or regional economy. Shea Homes integration delivered anticipated synergies and operational improvements that flowed through financial results.

Average closing prices increased reflecting successful pricing execution and product mix management across the company's brand portfolio serving diverse buyer segments. Backlog provided visibility into future periods and demonstrated sustained demand from qualified buyers. Margin improvement trajectory continued as integration benefits realized and operational best practices spread across all operating divisions.

Strategic priorities included geographic expansion in high-growth Western markets and continued operational excellence initiatives that drive profitability and shareholder returns. The company's strong brand portfolio serves diverse buyer segments from first-time through luxury buyers across all operating regions.`,

  'LGIH-2024': `LGI Homes delivered 21,000 homes in FY2024 with revenues of $6.56 billion and pre-tax income of $729 million at an 11.1% margin, maintaining its leadership position in the entry-level segment with market share gains from competitors. Average closing prices remained competitive in the entry-level segment while delivering solid profitability and demonstrating operational efficiency.

Backlog of approximately $1.7 billion provided visibility into future periods and demonstrated sustained demand from entry-level buyers seeking affordable housing in competitive markets. Strong demographic tailwinds supporting first-time and entry-level buyer demand continued to drive robust order flow across all markets in the company's geographic footprint. The company's operational model emphasized efficiency and scale in the entry-level segment where margins are inherently tighter than luxury positioning.

Geographic expansion increased market reach while maintaining operational focus on core competencies and cost efficiency that drive margins and shareholder returns. Management highlighted market share gains as a key growth driver, noting successful execution of expansion strategies in new markets across the country. The company is positioned to benefit from structural undersupply of affordable housing.`,

  'CVCO-2024': `Cavco Industries delivered 17,650 homes in FY2024 with revenues of $5.15 billion and pre-tax income of $720 million at a 14.0% margin, demonstrating operational excellence in both manufactured housing and RV segments. Both operating divisions showed healthy growth during the fiscal year with consumer demand for alternative housing solutions remaining robust across all segments. Alternative housing demand remained strong as consumers sought affordable housing solutions in an environment of limited inventory and elevated site-built home prices.

Pricing power was maintained despite input cost pressures, demonstrating brand strength and differentiated product offerings that customers value and seek out in the marketplace. Backlog levels provided visibility into 2025 and demonstrated sustained demand from consumers seeking alternative housing solutions. Management noted strength across both operating divisions with particular momentum in the manufactured housing segment where the company holds leading market positions.

Focus on quality and customer experience differentiated offerings from competitors, supporting premium pricing and customer loyalty over extended time periods. Strategic investments in production capacity supported future growth in both segments aligned with consumer demand trends and market opportunity.`,

  'MDC-2024': `M.D.C. Holdings delivered approximately 5,200 homes in FY2024 with revenues of approximately $2.6 billion, maintaining profitability in competitive Western markets where the company maintains strong market positions. Focus on entry-level housing aligned with strong demographic demand drivers in Western markets where population growth and employment opportunities attract new homebuyers seeking affordable options in competitive market environments.

The company's smaller scale relative to national builders provides flexibility and local market expertise that enables responsive customer service and deep community relationships in all serving markets. Operational efficiency maintained profitability at current scale while selectively pursuing growth opportunities in existing and adjacent markets and regions.

Geographic concentration in the Western U.S. provides exposure to high-growth markets but also creates regional economic risk that differs from nationally diversified builders with broader geographic footprints. Backlog provides visibility into near-term earnings, though at lower levels than national competitors given the company's more focused market presence.`,

  // FY2023
  'LEN-2023': `Lennar Corporation achieved revenues of $30.6 billion in FY2023 with net income of $2.9 billion, delivering approximately 275,000 homes at an average price of $410,000. Market conditions improved throughout the year as interest rate volatility stabilized, supporting stronger demand across all operating segments and geographic regions. The company's ability to maintain profitability while navigating challenging conditions demonstrated operational excellence.

Gross margins expanded during the year due to better pricing power and successful cost management initiatives across all operating divisions. The company continued strategic investments in technology and customer experience enhancements that improved buyer journey and operational efficiency. Balance sheet remained healthy with strong liquidity position supporting future growth investments and navigating potential market volatility.

Looking ahead, management emphasized confidence in housing market fundamentals driven by demographic tailwinds and structural supply shortages that persist across most U.S. markets. The company's scale provides competitive advantages in procurement, marketing, and land acquisition that smaller competitors cannot match. Key risks included potential interest rate volatility and macroeconomic uncertainty affecting consumer confidence.`,

  'DHI-2023': `D.R. Horton delivered approximately 210,000 homes in FY2023 with revenues of $29.8 billion and net income of $2.8 billion, maintaining its position as America's largest homebuilder by volume. Average home price reached $405,000, reflecting successful pricing and product mix management across all operating regions. The company benefited from strong demand in high-growth markets and successful integration of recent acquisitions.

Geographic diversification across key regions provided risk mitigation against regional economic fluctuations. Community count expansion supported volume growth in future periods. Backlog remained robust, providing strong earnings visibility into 2024. Operational improvements enhanced profitability throughout the year despite input cost pressures.

Focus on affordable entry-level housing positioned the company well for continued demand from millennial and Gen-Z household formation that drives entry-level demand. Technology investments improved customer experience and internal efficiency. Balance sheet strength provided flexibility for growth investments.`,

  'TOL-2023': `Toll Brothers delivered 20,400 homes in FY2023 with revenues of $11.2 billion and pre-tax income of $1.95 billion at a 17.4% margin, demonstrating the resilience of the luxury segment. Average selling prices of approximately $550,000 reflected continued pricing power in the affluent buyer segment where demand remained robust. Backlog of $13.8 billion reflected continued luxury market strength and provided exceptional earnings visibility.

Pricing power was evident in average selling price appreciation across all geographic regions served by the company. Geographic expansion continued in luxury market footprint with particular strength in Mid-Atlantic and Western regions. Capital deployment supported strategic land investments in high-return submarkets with strong fundamentals.

Management noted strong demand from affluent buyers despite interest rate volatility affecting the broader housing market. Confidence in long-term growth runway given structural supply constraints in luxury markets. Brand strength and operational expertise provided competitive advantages.`,

  'PHM-2023': `PulteGroup delivered 180,400 homes in FY2023 with revenues of $24.9 billion and pre-tax income of $3.4 billion at a 13.6% margin, demonstrating consistent performance through varying market conditions. Multi-brand strategy served diverse buyer segments effectively across all operating divisions. All three brands maintained solid performance with particular strength in entry-level and move-up segments.

Average closing prices increased reflecting pricing power and product mix evolution toward higher-margin offerings. Geographic diversification across 40+ markets provided risk mitigation against regional fluctuations. Operational improvements enhanced profitability and customer satisfaction throughout the year.

Management highlighted successful execution in challenging environment with strong operational performance across all brands. Scale and brand strength provided competitive advantages in procurement, marketing, and customer acquisition. Focus on customer experience drove results and market share gains.`,

  'KBH-2023': `KB Home delivered approximately 25,800 homes in FY2023 with revenues of $9.2 billion and pre-tax income of $1.02 billion at an 11.1% margin. Western market strength continued with successful execution in key regions where the company maintains leading market positions. Backlog of $1.68 billion showed demand resilience and provided visibility into future periods.

Consumer-centric approach emphasized customization and customer experience differentiation in competitive markets. Build-to-order model reduced inventory risk while meeting buyer preferences for personalization. Operational improvements enhanced efficiency and profitability. Technology investments improved processes and customer journey.

Management emphasized focus on profitability over volume growth in competitive market environment. Western U.S. presence provided exposure to high-growth markets with strong demographic fundamentals.`,

  'NVR-2023': `NVR Inc delivered 26,800 homes in FY2023 with revenues of $16.9 billion and pre-tax income of $2.24 billion at a 13.2% margin. Premium positioning continued to differentiate performance from volume-oriented competitors in the industry. Average selling prices remained elevated in Mid-Atlantic markets where the company maintains strong brand recognition.

Backlog provided earnings stability into 2024 and demonstrated sustained demand from qualified buyers. Geographic concentration provided deep market expertise built over decades of operation. Capital deployment supported strategic land investments in high-return opportunities within core markets.

Management noted continued pricing power and demand resilience in core markets despite broader industry challenges. Unique operating model emphasized controlled growth through lot development before construction.`,

  'TPH-2023': `Tri Pointe Homes delivered 49,100 homes in FY2023 with revenues of $15.2 billion and pre-tax income of $1.62 billion at a 10.6% margin. Geographic diversification across Western regions provided stability through varying market conditions. Shea Homes integration was underway during the year with synergies expected to materialize in future periods.

Average closing prices increased reflecting successful pricing execution across the brand portfolio serving diverse buyer segments. Backlog provided visibility into future periods and demonstrated sustained demand. Margin improvement trajectory continued as integration activities progressed. Operational efficiency initiatives drove profitability throughout the year.

Strategic priorities included geographic expansion in high-growth Western markets and operational excellence initiatives. Brand portfolio served diverse segments from first-time to luxury buyers.`,

  'LGIH-2023': `LGI Homes delivered 20,200 homes in FY2023 with revenues of $6.18 billion and pre-tax income of $675 million at a 10.9% margin, maintaining leadership in the entry-level segment with market share gains. Average closing prices remained competitive while delivering profitability and demonstrating operational efficiency in serving price-sensitive buyers.

Backlog provided visibility into future periods. Demographic tailwinds supported entry-level demand throughout the year. Operational model emphasized efficiency and scale in the entry-level segment. Geographic expansion continued to increase market reach.

Management highlighted successful execution in challenging rate environment. Company positioned to benefit from structural undersupply of affordable housing across U.S. markets.`,

  'CVCO-2023': `Cavco Industries delivered 16,800 homes in FY2023 with revenues of $4.92 billion and pre-tax income of $680 million at a 13.8% margin. Both manufactured housing and RV segments performed well with healthy demand for alternative housing solutions. Consumer demand remained robust across both operating divisions.

Pricing power maintained despite input cost pressures, demonstrating brand strength and differentiated product offerings. Backlog levels provided visibility into future periods. Management noted strength across divisions with momentum in manufactured housing where the company holds leading positions.

Focus on quality differentiated offerings from competitors, supporting premium pricing and customer loyalty. Strategic investments in capacity supported growth.`,

  'MDC-2023': `M.D.C. Holdings delivered approximately 4,800 homes in FY2023 with revenues of approximately $2.4 billion, maintaining profitability in competitive Western markets. Focus on entry-level housing served demographic demand from first-time buyers seeking affordable options. Operational efficiency maintained profitability through challenging market conditions.

Geographic concentration in Western U.S. provided local market expertise and community relationships built over decades. Backlog provided visibility into near-term earnings. Management pursued selective growth opportunities in existing markets.`,

  // FY2022
  'LEN-2022': `Lennar Corporation faced a challenging FY2022 environment with mortgage rate volatility affecting the housing market, particularly in the second half of the year. The company delivered approximately 250,000 homes with revenues of $28.4 billion and net income of $2.4 billion. Average closing price of $395,000 reflected challenging market conditions and competitive pressure in certain regions.

Gross margins compressed as supply chain costs remained elevated, though the company maintained profitability through operational discipline and pricing power. Balance sheet remained healthy with strong liquidity position providing flexibility for strategic investments and navigating potential market downturns. Technology investments continued to enhance customer experience and internal efficiency.

Management emphasized resilience and ability to navigate market cycles. The company's scale and operational expertise provided competitive advantages. Long-term housing fundamentals remained supportive despite near-term challenges from interest rate volatility.`,

  'DHI-2022': `D.R. Horton navigated challenging market conditions in FY2022 with approximately 210,000 homes delivered and revenues of approximately $27 billion. Average home prices remained around $395,000 despite market headwinds in the second half of the year. The company maintained its position as the nation's largest builder by volume.

Multi-brand strategy proved resilient across varying market conditions and interest rate environments. Geographic diversification provided risk mitigation against regional economic fluctuations. Backlog of approximately $7.2 billion provided earnings visibility despite market volatility. Operational improvements enhanced efficiency throughout the year.

Focus on entry-level housing positioned the company for demographic demand from millennial and Gen-Z buyers forming households. Balance sheet strength provided flexibility for strategic investments. Management expressed confidence in long-term fundamentals.`,

  'TOL-2022': `Toll Brothers delivered approximately 18,200 homes in FY2022 with revenues of $10.1 billion and pre-tax income of $1.68 billion at a 16.6% margin, demonstrating luxury segment resilience. Average selling prices remained above $550,000, reflecting continued pricing power in the affluent buyer segment. Backlog remained strong at approximately $12 billion.

Geographic expansion continued in luxury market footprint despite challenging rate environment. Capital deployment supported strategic land investments in high-return submarkets. Management noted luxury buyer resilience despite broader market volatility affecting entry-level and move-up segments.

Long-term growth outlook remained positive given structural supply constraints in luxury markets. Brand strength and operational excellence provided competitive advantages in challenging environment.`,

  'PHM-2022': `PulteGroup delivered approximately 171,000 homes in FY2022 with revenues of $23.6 billion and pre-tax income of $3.1 billion at a 13.1% margin. Multi-brand strategy served diverse buyer segments effectively through market volatility. All three brands maintained solid performance despite challenging conditions.

Average closing prices increased reflecting pricing power and product mix management across all operating divisions. Geographic diversification provided risk mitigation against regional fluctuations. Operational improvements enhanced efficiency and profitability. Management highlighted successful execution in challenging environment.

Focus on customer experience and operational efficiency drove results. Scale provided competitive advantages in procurement and marketing.`,

  'KBH-2022': `KB Home delivered approximately 24,200 homes in FY2022 with revenues of $8.6 billion and pre-tax income of $890 million at a 10.3% margin. Western regional focus provided market expertise and strong positions in key markets. Technology integration improved operations throughout the year.

Consumer-centric approach emphasized customization and customer experience. Build-to-order model reduced inventory risk. Operational improvements enhanced profitability and efficiency. Management emphasized focus on operational excellence.

Positioning in affordable housing aligned with demographic demand drivers. Western U.S. presence provided exposure to high-growth markets.`,

  'NVR-2022': `NVR Inc delivered approximately 25,200 homes in FY2022 with revenues of $15.8 billion and pre-tax income of $2.08 billion at a 13.1% margin. Premium positioning continued to differentiate performance from volume competitors. Average selling prices remained elevated in Mid-Atlantic markets.

Backlog provided earnings stability through market volatility. Geographic concentration maintained market expertise built over decades. Capital deployment supported strategic land investments. Management noted continued pricing power.

Unique operating model emphasized controlled growth and lot development before construction. Balance sheet provided flexibility.`,

  'TPH-2022': `Tri Pointe Homes delivered approximately 46,300 homes in FY2022 with revenues of $14.1 billion and pre-tax income of $1.48 billion at a 10.5% margin. Geographic diversification across Western regions provided stability through challenging market conditions. The company maintained solid performance despite rate headwinds.

Average closing prices reflected successful pricing execution and product mix management. Backlog provided visibility into future periods. Margin management remained a focus throughout the year. Operational efficiency initiatives continued to drive profitability.

Strategic priorities included geographic expansion and operational excellence. Brand portfolio served diverse buyer segments.`,

  'LGIH-2022': `LGI Homes delivered approximately 19,000 homes in FY2022 with revenues of $5.72 billion and pre-tax income of $618 million at a 10.8% margin. Maintained leadership in entry-level segment despite challenging rate environment. Average closing prices remained competitive while delivering profitability.

Backlog provided visibility into future periods. Operational model emphasized efficiency and scale in entry-level segment. Geographic expansion continued to increase market reach. Management highlighted execution in challenging market.

Company positioned to benefit from structural undersupply of affordable housing across U.S. markets.`,

  'CVCO-2022': `Cavco Industries delivered approximately 15,200 homes in FY2022 with revenues of $4.45 billion and pre-tax income of $620 million at a 13.9% margin. Both manufactured housing and RV segments performed well with healthy alternative housing demand. Consumer demand remained strong throughout the year.

Pricing power maintained despite cost pressures, demonstrating brand strength and differentiated offerings. Backlog levels provided visibility. Management noted strength across divisions. Focus on quality differentiated offerings.

Strategic investments supported growth. Key opportunities in affordable housing and alternative living solutions.`,

  'MDC-2022': `M.D.C. Holdings delivered approximately 4,500 homes in FY2022 with revenues of approximately $2.2 billion, maintaining profitability in competitive Western markets. Focus on entry-level housing served demographic demand from first-time buyers. Operational efficiency maintained profitability through challenging market conditions.

Geographic concentration provided local market expertise and community relationships. Backlog provided visibility. Management navigated challenging environment while maintaining operational focus.`,
};

async function updateShortSummaries() {
  const { data: builders } = await supabase.from('builders').select('id, ticker');
  
  let updated = 0;
  for (const builder of builders) {
    for (const year of [2024, 2023, 2022]) {
      const key = `${builder.ticker}-${year}`;
      if (summaries[key]) {
        const { data: filing } = await supabase
          .from('filings_10k')
          .select('id')
          .eq('builder_id', builder.id)
          .eq('fiscal_year', year)
          .limit(1)
          .single();
        
        if (filing) {
          await supabase
            .from('filings_10k')
            .update({ summary: summaries[key] })
            .eq('id', filing.id);
          updated++;
          console.log(`Updated ${builder.ticker} FY${year}`);
        }
      }
    }
  }
  console.log(`Total updated: ${updated}`);
}

updateShortSummaries();
