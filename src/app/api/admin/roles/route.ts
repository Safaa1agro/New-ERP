// src/app/api/admin/roles/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 1. Fetch all roles, permissions, and role_permissions mappings
export async function GET() {
  const supabase = await createClient();

    const { data: roles, error: rolesErr } = await supabase
        .from('roles')
            .select('*')
                .order('created_at', { ascending: true });

                  const { data: permissions, error: permErr } = await supabase
                      .from('permissions')
                          .select('*')
                              .order('module', { ascending: true });

                                const { data: rolePermissions, error: rpErr } = await supabase
                                    .from('role_permissions')
                                        .select('*');

                                          if (rolesErr || permErr || rpErr) {
                                              return NextResponse.json(
                                                    { error: rolesErr?.message || permErr?.message || rpErr?.message },
                                                          { status: 500 }
                                                              );
                                                                }

                                                                  return NextResponse.json({ roles, permissions, rolePermissions });
                                                                  }

                                                                  // 2. Create a new custom designation/role
                                                                  export async function POST(req: Request) {
                                                                    const supabase = await createClient();
                                                                      const { name, description } = await req.json();

                                                                        if (!name) {
                                                                            return NextResponse.json({ error: 'Designation name is required' }, { status: 400 });
                                                                              }

                                                                                const { data, error } = await (supabase as any)
                                                                                    .from('roles')
                                                                                        .insert([{ name, description }])
                                                                                            .select()
                                                                                                .single();

                                                                                                  if (error) {
                                                                                                      return NextResponse.json({ error: error.message }, { status: 500 });
                                                                                                        }

                                                                                                          return NextResponse.json({ role: data });
                                                                                                          }

                                                                                                          // 3. Update active permissions for a specific role
                                                                                                          export async function PATCH(req: Request) {
                                                                                                            const supabase = await createClient();
                                                                                                              const { roleId, permissionIds } = await req.json();

                                                                                                                if (!roleId || !Array.isArray(permissionIds)) {
                                                                                                                    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
                                                                                                                      }

                                                                                                                        // Clear existing permissions for this role
                                                                                                                          const { error: deleteErr } = await supabase
                                                                                                                              .from('role_permissions')
                                                                                                                                  .delete()
                                                                                                                                      .eq('role_id', roleId);

                                                                                                                                        if (deleteErr) {
                                                                                                                                            return NextResponse.json({ error: deleteErr.message }, { status: 500 });
                                                                                                                                              }

                                                                                                                                                // Insert newly selected permissions
                                                                                                                                                  if (permissionIds.length > 0) {
                                                                                                                                                      const newMappings = permissionIds.map((pId: string) => ({
                                                                                                                                                            role_id: roleId,
                                                                                                                                                                  permission_id: pId,
                                                                                                                                                                      }));

                                                                                                                                                                          const { error: insertErr } = await (supabase as any)
                                                                                                                                                                                .from('role_permissions')
                                                                                                                                                                                      .insert(newMappings);

                                                                                                                                                                                          if (insertErr) {
                                                                                                                                                                                                return NextResponse.json({ error: insertErr.message }, { status: 500 });
                                                                                                                                                                                                    }
                                                                                                                                                                                                      }

                                                                                                                                                                                                        return NextResponse.json({ success: true });
                                                                                                                                                                                                        }
                                                                                                                                                                                                        