import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';

const Users = () => {
  const [role, setRole] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (!error && data) setRole(data.role);
      }
    };
    fetchRole();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    // Get all profiles (email, role, created_at)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_at');
    setUsers(error ? [] : profiles || []);
    setLoading(false);
  };

  useEffect(() => {
    if (role === 'admin') fetchUsers();
  }, [role]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <Navbar role={role} onLogout={handleLogout} />
      <div className="min-h-screen bg-gray-100">
        <div className="p-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">User Management</h2>
            <div className="mb-6 text-blue-700 bg-blue-50 border border-blue-200 rounded p-4">
              To add a new user, please contact the admin.
            </div>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full bg-white border rounded-xl overflow-hidden shadow text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Email</th>
                    <th className="px-4 py-2 border">Role</th>
                    <th className="px-4 py-2 border">Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} className="text-center py-4">Loading...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-4">No users found.</td></tr>
                  ) : (
                    users.map((user, idx) => (
                      <tr key={user.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-2 border">{user.email}</td>
                        <td className="px-4 py-2 border capitalize">{user.role}</td>
                        <td className="px-4 py-2 border">{user.created_at ? new Date(user.created_at).toLocaleString() : ''}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Users;
