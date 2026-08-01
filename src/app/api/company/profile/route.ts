import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Note: If using @supabase/ssr in Next.js 15, createClient() might need an 'await'
    const supabase = await createClient();

    // 1. Fetch Profile (.maybeSingle prevents 500 errors on empty tables)
    const { data: profile, error: profileError } = await supabase
      .from('company_profile')
      .select('*')
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 2. Fetch Financial Summary View
    const { data: summary, error: summaryError } = await supabase
      .from('vw_company_financial_summary')
      .select('*')
      .maybeSingle();

    if (summaryError) {
      console.error('Error fetching financial summary:', summaryError.message);
    }

    return NextResponse.json({
      profile: profile ?? null,
      summary: summary ?? null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
