import { createClient } from '@/lib/supabase/server';
import { UserProfile } from '@/types/database.types';
import { hasPermission } from '@/lib/rbac';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const supabase = await createClient();

  // 1. Get currently logged-in auth user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch active user's profile with their linked permissions
  const { data: currentUserProfile } = await supabase
    .from('user_profiles')
    .select(`
      *,
      roles (
        name,
        role_permissions (
          permissions ( action_key )
        )
      )
    `)
    .eq('id', user.id)
    .single();

  // Cast to any to bypass Supabase join type checking
  const profile = currentUserProfile as any;

  // Extract array of active action keys (e.g. ['users:create', 'users:update'])
  const activePermissions = profile?.roles?.role_permissions
    ?.map((rp: any) => rp.permissions?.action_key)
    .filter(Boolean) || [];

  // Build the permission context object
  const userContext = {
    role: profile?.roles?.name,
    isSuperAdmin: profile?.is_super_admin ?? false,
    permissions: activePermissions,
  };

  // 3. Define permission flags for UI elements
  const canCreateUser = hasPermission(userContext, 'users:create');
  const canEditRole = hasPermission(userContext, 'users:update');

  // 4. Fetch user list table data
  const { data: profiles, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Administration</h1>
          <p className="text-sm text-slate-400">Manage user authorization and roles</p>
        </div>

        {/* --- PROTECTED BUTTON 1: Only renders if user has 'users:create' or is Super Admin --- */}
        {canCreateUser && (
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg text-sm">
            + Invite New User
          </button>
        )}
      </div>

      {error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          Failed to load profile entries.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {profiles?.map((p: UserProfile) => (
                <tr key={p.id}>
                  <td className="p-4 font-medium text-white">{p.email}</td>
                  <td className="p-4 text-emerald-400">Active</td>
                  <td className="p-4 text-right">
                    {/* --- PROTECTED BUTTON 2: Action dropdown only visible if allowed --- */}
                    {canEditRole ? (
                      <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-md border border-slate-700">
                        Edit Access
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Read Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
