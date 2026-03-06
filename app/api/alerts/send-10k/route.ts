import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { send10KAlert } from '@/lib/sendgrid-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * POST /api/alerts/send-10k
 * Sends 10-K filing alerts to all subscribers for a builder
 *
 * Body: {
 *   builderId: string;
 *   filingId: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.ALERTS_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { builderId, filingId } = body;

    if (!builderId || !filingId) {
      return NextResponse.json(
        { error: 'builderId and filingId required' },
        { status: 400 }
      );
    }

    // Get builder info
    const { data: builder, error: builderError } = await supabase
      .from('builders')
      .select('*')
      .eq('id', builderId)
      .single();

    if (builderError || !builder) {
      return NextResponse.json(
        { error: 'Builder not found' },
        { status: 404 }
      );
    }

    // Get filing info
    const { data: filing, error: filingError } = await supabase
      .from('filings_10k')
      .select('*')
      .eq('id', filingId)
      .single();

    if (filingError || !filing) {
      return NextResponse.json(
        { error: 'Filing not found' },
        { status: 404 }
      );
    }

    // Get all subscribers for this builder
    const { data: subscriptions, error: subError } = await supabase
      .from('alert_subscriptions')
      .select('email')
      .eq('builder_id', builderId)
      .eq('is_active', true);

    if (subError) {
      return NextResponse.json(
        { error: 'Error fetching subscriptions' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { success: true, sent: 0, message: 'No active subscriptions' },
        { status: 200 }
      );
    }

    // Send emails to all subscribers
    let sent = 0;
    let failed = 0;

    for (const sub of subscriptions) {
      const result = await send10KAlert(sub.email, builder, filing);
      if (result) {
        sent++;
        // Mark email as sent in database
        await supabase
          .from('filings_10k')
          .update({ alert_sent: true })
          .eq('id', filingId);
      } else {
        failed++;
      }
    }

    return NextResponse.json(
      {
        success: true,
        sent,
        failed,
        total: subscriptions.length,
        message: `Sent ${sent}/${subscriptions.length} 10-K alerts`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error sending 10-K alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
