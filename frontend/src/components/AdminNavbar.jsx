import React from 'react'
import { assets } from './../assets/assets';
import { NavLink } from 'react-router-dom';

const AdminNavbar = () => {
  return (
    <div className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 font-medium">
        <div className="flex items-center gap-4">
          <img src={assets.logo} className="w-36" alt="Logo" />
          <h1 className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-medium px-4 py-1.5 rounded-full shadow-sm text-lg">
            Admin Panel
          </h1>
        </div>
        <ul className="hidden sm:flex gap-8 text-xl text-gray-700">
          {["DASHBOARD", "SELLERS", "CLIENTS", "PRODUCTS"].map((item) => (
            <NavLink
              key={item}
              to={`/admin/${item.toLowerCase()}`}
              className={({ isActive }) =>
                `relative flex flex-col items-center group ${
                  isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"
                }`
              }
            >
              <span>{item}</span>
              <span className="absolute -bottom-1 w-0 h-[2px] bg-blue-600 rounded group-hover:w-1/2 transition-all duration-300"></span>
            </NavLink>
          ))}
        </ul>
        <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-6 py-2 rounded-full shadow-sm text-sm font-medium">
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;