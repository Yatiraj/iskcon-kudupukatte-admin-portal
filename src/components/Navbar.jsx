import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = ({ role, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white w-full py-3 flex items-center gap-4 shadow-md px-6">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `px-3 py-2 rounded transition-colors duration-150 ${isActive ? 'bg-gray-800 font-bold' : 'hover:bg-gray-700'}`
        }
      >
        Dashboard
      </NavLink>
      <NavLink
        to="/devotees"
        className={({ isActive }) =>
          `px-3 py-2 rounded transition-colors duration-150 ${isActive ? 'bg-gray-800 font-bold' : 'hover:bg-gray-700'}`
        }
      >
        Devotees
      </NavLink>
      {role === 'admin' && (
        <NavLink
          to="/users"
          className={({ isActive }) =>
            `px-3 py-2 rounded transition-colors duration-150 ${isActive ? 'bg-gray-800 font-bold' : 'hover:bg-gray-700'}`
          }
        >
          Users
        </NavLink>
      )}
      <div className="flex-1" />
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded shadow transition-colors duration-150"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
