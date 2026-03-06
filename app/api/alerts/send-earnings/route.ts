import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEarningsAlert } from '@/lib/sendgrid-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * POST /api/alerts/send-earnings
 * Sends earnings call alerts to all subscribers for a builder
 *
 * Body: {
 *   builderId: string;
 *   callId: string;
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
    const { builderId, callId } = body;

    if (!builderId || !callId) {
      return NextResponse.json(
        { error: 'builderId and callId required' },
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

    // Get earnings call info
    const { data: call, error: callError } = await supabase
      .from('earnings_calls')
      .select('*')
      .eq('id', callId)
      .single();

    if (callError || !call) {
      return NextResponse.json(
        { error: 'Earnings call not found' },
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
      const result = await sendEarningsAlert(sub.email, builder, call);
      if (result) {
        sent++;
        // Mark email as sent in database
        await supabase
          .from('earnings_calls')
          .update({ alert_sent: true })
          .eq('id', callId);
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
        message: `Sent ${sent}/${subscriptions.length} earnings alerts`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error sending earnings alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
