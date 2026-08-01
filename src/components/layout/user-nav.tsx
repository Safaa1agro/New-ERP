'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LogOut, User } from 'lucide-react';

interface UserNavProps {
  user: {
      email: string;
          full_name: string;
              role: string;
                };
                }

                export function UserNav({ user }: UserNavProps) {
                  const router = useRouter();
                    const supabase = createClient();

                      const handleSignOut = async () => {
                          await supabase.auth.signOut();
                              router.push('/login');
                                  router.refresh();
                                    };

                                      return (
                                          <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50">
                                                <div className="bg-slate-700 p-1.5 rounded-full text-slate-300">
                                                        <User className="h-4 w-4" />
                                                              </div>
                                                                    <div className="text-left hidden sm:block">
                                                                            <p className="text-xs font-semibold text-white leading-none">{user.full_name}</p>
                                                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{user.role}</span>
                                                                                          </div>
                                                                                                <button
                                                                                                        onClick={handleSignOut}
                                                                                                                className="ml-2 text-slate-400 hover:text-red-400 transition"
                                                                                                                        title="Sign Out"
                                                                                                                              >
                                                                                                                                      <LogOut className="h-4 w-4" />
                                                                                                                                            </button>
                                                                                                                                                </div>
                                                                                                                                                  );
                                                                                                                                                  }