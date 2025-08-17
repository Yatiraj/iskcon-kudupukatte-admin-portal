import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';

const donorTypes = ['HNI', 'Regular', 'One-time'];
const associationStatuses = ['Congregation', 'New Devotee', 'Well-wisher'];

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const [devotees, setDevotees] = useState([]);
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

  useEffect(() => {
    const fetchDevotees = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('devotees')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setDevotees(data);
      setLoading(false);
    };
    fetchDevotees();
  }, []);

  // Summary stats
  const totalDevotees = devotees.length;
  const donorTypeCounts = donorTypes.map(type => ({
    type,
    count: devotees.filter(d => d.donor_type === type).length,
  }));
  const associationStatusCounts = associationStatuses.map(status => ({
    status,
    count: devotees.filter(d => d.association_status === status).length,
  }));
  const recentDevotees = devotees.slice(0, 5);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <Navbar role={role} onLogout={handleLogout} />
      <div className="min-h-screen bg-gray-100">
        <div className="p-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <div className="text-3xl font-bold text-blue-600">{totalDevotees}</div>
              <div className="text-gray-600 mt-2">Total Devotees</div>
            </div>
            {donorTypeCounts.map(({ type, count }) => (
              <div key={type} className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-2xl font-bold text-green-600">{count}</div>
                <div className="text-gray-600 mt-2">{type} Donors</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {associationStatusCounts.map(({ status, count }) => (
              <div key={status} className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <div className="text-2xl font-bold text-purple-600">{count}</div>
                <div className="text-gray-600 mt-2">{status}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow p-6 mt-8">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Recently Added Devotees</h3>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border">Phone</th>
                      <th className="px-4 py-2 border">Name</th>
                      <th className="px-4 py-2 border">Donor Type</th>
                      <th className="px-4 py-2 border">Association Status</th>
                      <th className="px-4 py-2 border">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentDevotees.map((d, idx) => (
                      <tr key={d.phone} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-2 border">{d.phone}</td>
                        <td className="px-4 py-2 border">{d.name}</td>
                        <td className="px-4 py-2 border">{d.donor_type}</td>
                        <td className="px-4 py-2 border">{d.association_status}</td>
                        <td className="px-4 py-2 border">{new Date(d.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                    {recentDevotees.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-4">No devotees found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
