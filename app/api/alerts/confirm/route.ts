import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendConfirmationEmail } from '@/lib/sendgrid-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/**
 * POST /api/alerts/confirm
 * Called when user subscribes - sends confirmation email
 *
 * Body: {
 *   email: string;
 *   builderIds: string[];
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, builderIds } = body;

    if (!email || !builderIds || !Array.isArray(builderIds)) {
      return NextResponse.json(
        { error: 'email and builderIds array required' },
        { status: 400 }
      );
    }

    // Get builder names
    const { data: builders, error: buildersError } = await supabase
      .from('builders')
      .select('name, id')
      .in('id', builderIds);

    if (buildersError || !builders) {
      return NextResponse.json(
        { error: 'Error fetching builders' },
        { status: 500 }
      );
    }

    // Send confirmation email
    const builderNames = builders.map((b) => b.name);
    const emailSent = await sendConfirmationEmail(email, builderNames);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }

    // Create subscriptions for each builder
    const subscriptions = builderIds.map((builderId) => ({
      email,
      builder_id: builderId,
      is_active: true,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('alert_subscriptions')
      .insert(subscriptions);

    if (insertError) {
      console.error('Error creating subscriptions:', insertError);
      return NextResponse.json(
        { error: 'Error creating subscriptions' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Confirmation email sent to ${email}`,
        subscribedTo: builderNames,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error confirming subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
