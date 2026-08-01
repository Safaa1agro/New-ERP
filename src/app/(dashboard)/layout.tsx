import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AppRole } from '@/types/database.types';

export default async function DashboardLayout({
  children,
  }: {
    children: React.ReactNode;
    }) {
      const supabase = createClient();

        const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
              redirect('/login');
                }

                  const { data: profile } = await supabase
                      .from('user_profiles')
                          .select('*')
                              .eq('id', user.id)
                                  .single();

                                    const userData = {
                                        email: user.email || '',
                                        full_name: (profile as any)?.full_name || user.email || 'System User',
                                        role: ((profile as any)?.role as AppRole) || 'ROLE_SALES',
                                                  };

                                                    return (
                                                        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
                                                              <Sidebar userRole={userData.role} />
                                                                    <div className="flex-1 flex flex-col min-w-0">
                                                                            <Header user={userData} />
                                                                                    <main className="flex-1 overflow-y-auto p-6">{children}</main>
                                                                                          </div>
                                                                                              </div>
                                                                                                );
                                                                                                }