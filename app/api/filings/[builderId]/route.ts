import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * GET /api/filings/[builderId]
 * Returns all 10-K and 10-Q filings for a builder
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { builderId: string } }
) {
  try {
    const { builderId } = params;

    // Fetch 10-K filings
    const { data: tenKs, error: tenKError } = await supabase
      .from('filings_10k')
      .select('*')
      .eq('builder_id', builderId)
      .order('fiscal_year', { ascending: false });

    if (tenKError) {
      return NextResponse.json(
        { error: 'Error fetching 10-K filings' },
        { status: 500 }
      );
    }

    // Fetch 10-Q filings (from earnings_calls table for now)
    const { data: tenQs, error: tenQError } = await supabase
      .from('earnings_calls')
      .select('*')
      .eq('builder_id', builderId)
      .order('call_date', { ascending: false });

    if (tenQError) {
      return NextResponse.json(
        { error: 'Error fetching 10-Q filings' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        tenK: tenKs || [],
        tenQ: tenQs || [],
        total: (tenKs?.length || 0) + (tenQs?.length || 0),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error fetching filings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
