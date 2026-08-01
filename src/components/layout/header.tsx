'use client';

import { UserNav } from './user-nav';

interface HeaderProps {
  user: {
      email: string;
          full_name: string;
              role: string;
                };
                }

                export function Header({ user }: HeaderProps) {
                  return (
                      <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full">
                                              PRODUCTION BUILD
                                                      </span>
                                                            </div>

                                                                  <div className="flex items-center gap-4">
                                                                          <UserNav user={user} />
                                                                                </div>
                                                                                    </header>
                                                                                      );
                                                                                      }