import React, { useState } from 'react'
import { assets } from './../assets/assets';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Admin from './../pages/Admin';

const AdminNavbar = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 font-medium">
        <div className="flex items-center gap-4">
          <Link to='/admin'><img src={assets.logo} className="w-36" alt="Logo" /></Link>
          <h1 className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-medium px-3 sm:px-4 py-1 rounded-full shadow-sm text-sm sm:text-lg">
            Admin Panel
          </h1>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden sm:flex gap-8 text-xl text-gray-700">
          {["DASHBOARD", "SELLERS", "CLIENTS", "PRODUCTS", "ORDERS"].map((item) => {
            let path = "";

            if (item === "SELLERS") path = "/sellers";
            else if (item === "CLIENTS") path = "/clients";
            else if (item === "PRODUCTS") path = "/products";
            else path = `/admin/${item.toLowerCase()}`;

            return (
            <NavLink
              key={item}
              to={path}
              className={({ isActive }) =>
                `relative flex flex-col items-center group ${
                  isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"
                }`
              }
            >
              <span>{item}</span>
              <span className="absolute -bottom-1 w-0 h-[2px] bg-blue-600 rounded group-hover:w-1/2 transition-all duration-300"></span>
            </NavLink>
            );
          })}

        </ul>
        <button onClick={handleLogout} className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-6 py-2 rounded-full shadow-sm text-sm font-medium">
          Logout
        </button>

        {/* Mobile Menu Button */}
        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className="w-8 cursor-pointer sm:hidden"
          alt="menu"
        />
      </div>

      {/* Sidebar menu for mobile */}
      <div className={`fixed top-0 right-0 h-screen bg-white shadow-lg transition-all duration-300 ease-in-out ${visible ? 'w-full' : 'w-0'} sm:hidden z-50`}>
        <div className='flex flex-col text-gray-600'>
          <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
            <img className='h-5' src={assets.back_icon} alt="" />
            <p>Back</p>
          </div>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/admin/dashboard'>DASHBOARD</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/sellers'>SELLERS</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/clients'>CLIENTS</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/products'>PRODUCTS</NavLink>
          <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/admin/orders'>ORDERS</NavLink>
        </div>
      </div>

    </div>
  );
};

export default AdminNavbar;