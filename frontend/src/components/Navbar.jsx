import React, { useState, useContext } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { assets } from './../assets/assets';
import { ShopContext } from '../context/ShopContext';

const Navbar = () => {

    const [visible, setVisible] = useState(false);

    const{setFocusSearch, setShowSearch} = useContext(ShopContext);
    const{getCartCount} = useContext(ShopContext);
    const navigate = useNavigate();

    const handleSearchClick = () => {
    // 검색어가 없으면 Products 페이지 이동만
        navigate('/products');
        setShowSearch(true);
        setFocusSearch(true);
    }


  return (
    // this is where i put the logo left up and home for right up

    <div className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 font-medium">

        {/* Logo */}
        <Link to='/'><img src={assets.logo} className='w-36' alt="" /></Link>
      
      {/* Desktop Menu */}
      <ul className="hidden sm:flex gap-8 text-xl text-gray-700">
          {["HOME", "PRODUCTS", "SELLERS", "ABOUT", "CONTACT"].map((item) => (
            <NavLink key={item} to={item === "HOME" ? "/" : `/${item.toLowerCase()}`} className={({ isActive }) => `relative flex flex-col items-center group ${isActive ? "text-blue-600 font-semibold" : "hover:text-blue-600"}`}>
              <span>{item}</span>
              <span className="absolute -bottom-1 w-0 h-[2px] bg-blue-600 rounded group-hover:w-1/2 transition-all duration-300"></span>
            </NavLink>
          ))}
      </ul>
      
      {/* Search */}
      <div className='flex items-center gap-6'>
            <img onClick={handleSearchClick} src={assets.search_icon} className='w-7 cursor-pointer hover:opacity-80' alt=""/>
            
            {/* Profile */}
            <div className='group relative'>
                <Link to='/login'><img className='w-8 cursor-pointer' src={assets.profile_icon} alt=""/></Link>
                <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
                    <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
                        <p className='cursor-pointer hover:text-black' onClick={() => navigate('/login')}>Login</p>
                        <p className='cursor-pointer hover:text-black' onClick={() => navigate('/orders')}>Order</p>

                    </div>
                </div>
            </div>

            {/* Cart */}
            <Link to='/cart' className='relative'>
                <img src={assets.cart_icon} className='w-8 min-w-5' alt=""/>
                <p className='absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs rounded-full'>{getCartCount()}</p>
            </Link>

            {/* Mobile Menu Button */}
            <img onClick={() => setVisible(true)} src={assets.menu_icon} className='w-8 cursor-pointer sm:hidden' alt=""/>
      </div>
    </div>

      {/* Sidebar menu for mobile*/}
      <div className={`fixed top-0 right-0 h-screen bg-white shadow-lg transition-all duration-300 ease-in-out ${visible ? 'w-full' : 'w-0'} sm:hidden z-50`}>
              <div className='flex flex-col text-gray-600'>
                 <div onClick={() => setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
                    <img className='h-5' src={assets.back_icon}  alt="" />
                    <p>Back</p>
                 </div>
                 <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/'>HOME</NavLink>
                 <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/products'>PRODUCTS</NavLink>
                 <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/sellers'>SELLERS</NavLink>
                 <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/about'>ABOUT</NavLink>
                 <NavLink onClick={() => setVisible(false)} className='py-2 pl-6 border' to='/contact'>CONTACT</NavLink>
              </div>
      </div>

    </div>
  )
}

export default Navbar
