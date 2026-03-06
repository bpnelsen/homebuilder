-- Create earnings_calls table (for actual transcript summaries, not SEC filings)
CREATE TABLE IF NOT EXISTS earnings_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id) ON DELETE CASCADE,
  fiscal_year INTEGER NOT NULL,
  fiscal_quarter INTEGER NOT NULL,
  call_date DATE NOT NULL,
  transcript_url TEXT,
  transcript_source TEXT, -- 'seeking_alpha', 'company_ir', 'motley_fool'
  transcript_summary TEXT, -- 800-1200 word Claude summary
  key_quotes TEXT[], -- Array of important executive quotes
  key_highlights TEXT[], -- Array of key discussion points
  analyst_questions TEXT, -- Q&A summary
  alert_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create investor_presentations table
CREATE TABLE IF NOT EXISTS investor_presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID NOT NULL REFERENCES builders(id) ON DELETE CASCADE,
  presentation_date DATE NOT NULL,
  presentation_title TEXT NOT NULL, -- e.g., "Q1 2024 Investor Presentation"
  presentation_url TEXT NOT NULL, -- Link to PDF or web version
  presentation_source TEXT, -- 'company_ir', 'sec_edgar', 'investor_day'
  presentation_type TEXT, -- 'quarterly', 'earnings_day', 'investor_day', 'conference'
  presentation_summary TEXT, -- 800-1200 word Claude summary of key slides
  key_slides TEXT[], -- Array of important slide topics/findings
  financial_guidance TEXT, -- Forward guidance extracted from presentation
  pdf_link TEXT, -- Direct link to PDF if available
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Update earnings_calls table with unique constraint
ALTER TABLE earnings_calls ADD CONSTRAINT unique_earnings_call UNIQUE (builder_id, fiscal_year, fiscal_quarter);

-- Update investor_presentations table with unique constraint
ALTER TABLE investor_presentations ADD CONSTRAINT unique_presentation UNIQUE (builder_id, presentation_date, presentation_title);

-- Create indexes for faster queries
CREATE INDEX idx_earnings_calls_builder ON earnings_calls(builder_id);
CREATE INDEX idx_earnings_calls_date ON earnings_calls(call_date);
CREATE INDEX idx_presentations_builder ON investor_presentations(builder_id);
CREATE INDEX idx_presentations_date ON investor_presentations(presentation_date);

-- RLS Policies (allow public read, admin write)
ALTER TABLE earnings_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_presentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read earnings_calls" ON earnings_calls FOR SELECT USING (true);
CREATE POLICY "Allow public read presentations" ON investor_presentations FOR SELECT USING (true);
