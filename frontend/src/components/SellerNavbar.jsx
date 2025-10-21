import React, { useState } from 'react'
import { assets } from './../assets/assets';
import { NavLink, Link } from 'react-router-dom';
import MyProducts from './../pages/MyProducts';
import Sellers from './../pages/Sellers';

const SellerNavbar = () => {
  const [visible, setVisible] = useState(false);

  return (
      <div className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 font-medium">
          <div className="flex items-center gap-4">
            <Link to='/sellers'><img src={assets.logo} className="w-36" alt="Logo" /></Link>
            <h1 className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-medium px-3 sm:px-4 py-1 rounded-full shadow-sm text-sm sm:text-lg">
              Seller
            </h1>
          </div>
  
          {/* Desktop Menu */}
          <ul className="hidden sm:flex gap-8 text-xl text-gray-700">
            {["MY PRODUCTS", "ORDERS", "ALL PRODUCTS", "ABOUT", "CONTACT"].map((item) => {
              let path = "";
  
              if (item === "MY PRODUCTS") path = "/myproducts";
              else if (item === "ORDERS") path = "/myorders";
              else if (item === "ALL PRODUCTS") path = "/products";
              else if (item === "ABOUT") path = "/about";
              else if (item === "CONTACT") path = "/contact";
              
   
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
          <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white px-6 py-2 rounded-full shadow-sm text-sm font-medium">
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
            <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/myproduct'>My PRODUCTS</NavLink>
            <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/myorders'>ORDERS</NavLink>
            <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/products'>ALL PRODUCTS</NavLink>
            <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/about'>ABOUT</NavLink>
            <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/contact'>CONTACT</NavLink>
          </div>
        </div>
  
      </div>
    );
  };

export default SellerNavbar
