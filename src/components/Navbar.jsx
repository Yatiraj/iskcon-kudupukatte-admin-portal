import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = ({ role, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white px-4 py-3 flex items-center gap-4">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `px-3 py-2 rounded ${isActive ? 'bg-gray-700 font-bold' : 'hover:bg-gray-700'}`
        }
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/devotees"
        className={({ isActive }) =>
          `px-3 py-2 rounded ${isActive ? 'bg-gray-700 font-bold' : 'hover:bg-gray-700'}`
        }
      >
        Devotees
      </NavLink>
      {role === 'admin' && (
        <NavLink
          to="/users"
          className={({ isActive }) =>
            `px-3 py-2 rounded ${isActive ? 'bg-gray-700 font-bold' : 'hover:bg-gray-700'}`
          }
        >
          Users
        </NavLink>
      )}
      <div className="flex-1" />
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
