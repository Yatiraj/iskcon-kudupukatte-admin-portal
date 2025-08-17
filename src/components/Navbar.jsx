import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/iskcon-kudupukatte-logo.png';

const Navbar = ({ role, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 text-white w-full py-3 flex items-center gap-4 shadow-md px-6">
      <div className="flex items-center gap-4 mr-6">
        <img src={logo} alt="ISKCON Kudupu Katte Logo" className="h-16 w-auto" />
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-wide leading-tight uppercase">ISKCON KUDUPUKATTE</span>
          <span className="text-base font-semibold tracking-wide text-blue-200">Admin Portal</span>
        </div>
      </div>
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
          Portal Users
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
