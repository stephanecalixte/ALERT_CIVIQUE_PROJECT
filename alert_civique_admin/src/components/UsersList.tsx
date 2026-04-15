import { useEffect, useState } from 'react';
import { useApp } from '../contexts/AppContext';   // ← Import correct
import { api, fmtDate } from '../services/api';
import { Users, UserX, RefreshCw, Crown, CheckCircle, XCircle } from 'lucide-react';
import type { AdminUser } from '../types';

export function UsersList() {
  const { token, toast } = useApp();   // ← OK
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.getUsers(token);
      setUsers(data);
    } catch (err) {
      toast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [token]);

  const deleteUser = async (id: number | undefined) => {
    if (!id) return;
    if (confirm('Delete this user permanently?')) {
      try {
        await api.deleteUser(id, token);
        toast('User deleted', 'success');
        load();
      } catch {
        toast('Delete failed', 'error');
      }
    }
  };

  if (loading) return <div className="text-cyan-300">Loading users...</div>;

  const getRoleLabel = (user: AdminUser) => {
    const roles = user.roles || [];
    if (roles.some(r => (typeof r === 'string' ? r : r.name) === 'ADMIN')) return 'ADMIN';
    if (roles.some(r => (typeof r === 'string' ? r : r.name) === 'MODERATOR')) return 'MODERATOR';
    return 'USER';
  };

  const roleBadgeClass = (role: string) => {
    if (role === 'ADMIN') return 'bg-red-900/50 text-red-300 border-red-700';
    if (role === 'MODERATOR') return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
    return 'bg-blue-900/50 text-blue-300 border-blue-700';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users size={24} /> User Management
        </h2>
        <button onClick={load} className="p-2 rounded bg-cyan-900/50 hover:bg-cyan-800">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-cyan-800">
            <tr className="text-left text-gray-400">
              <th className="pb-2">ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Registered</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const role = getRoleLabel(user);
              return (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-white/5">
                  <td className="py-3 font-mono">#{user.id}</td>
                  <td className="font-medium flex items-center gap-1">
                    {role === 'ADMIN' && <Crown size={14} className="text-yellow-500" />}
                    {user.firstname} {user.lastname}
                  </td>
                  <td className="text-gray-300">{user.email}</td>
                  <td><span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${roleBadgeClass(role)}`}>{role}</span></td>
                  <td>
                    {user.active ? (
                      <span className="flex items-center gap-1 text-green-400"><CheckCircle size={14}/> Active</span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400"><XCircle size={14}/> Inactive</span>
                    )}
                  </td>
                  <td>{fmtDate(user.createdAt)}</td>
                  <td>
                    <button onClick={() => deleteUser(user.id)} className="p-1 rounded bg-red-900/50 hover:bg-red-800 transition" title="Delete user">
                      <UserX size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}