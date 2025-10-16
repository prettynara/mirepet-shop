import React from 'react'
import { assets } from './../assets/assets';

const AdminNavbar = () => {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
           
      <div className="flex items-center gap-4">
        <img src={assets.logo} className="w-36" alt="Logo" />
        <h1 className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-medium px-4 py-1.5 rounded-full shadow-sm text-lg">
          Admin Panel
        </h1>
      </div>
   
      <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-6 py-2 rounded-full shadow-sm text-sm font-medium">
        Logout
      </button>
    </div>
  );
};

export default AdminNavbar;
