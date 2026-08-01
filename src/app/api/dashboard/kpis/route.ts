import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

    const { data: kpis, error: kpiError } = await supabase
        .from('vw_dashboard_kpis')
            .select('*')
                .single();

                  if (kpiError) {
                      return NextResponse.json({ error: kpiError.message }, { status: 500 });
                        }

                          const { data: coldStorageLogs } = await supabase
                              .from('cold_storage_monitoring')
                                  .select('*')
                                      .order('recorded_at', { ascending: false });

                                        const { data: shipments } = await supabase
                                            .from('export_shipments_summary')
                                                .select('*')
                                                    .order('departure_date', { ascending: false });

                                                      return NextResponse.json({
                                                          kpis,
                                                              coldStorageLogs: coldStorageLogs || [],
                                                                  shipments: shipments || []
                                                                    });
                                                                    }