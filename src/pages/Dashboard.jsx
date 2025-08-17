import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [role, setRole] = useState(null);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <Navbar role={role} onLogout={handleLogout} />
      <div className="p-8">
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        {/* Role-based dashboard content will go here */}
      </div>
    </>
  );
};

export default Dashboard;
