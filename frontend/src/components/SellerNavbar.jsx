import React, { useState, useEffect } from 'react'
import { assets } from './../assets/assets';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';


const SellerNavbar = () => {
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [orderCount, setOrderCount] = useState(0);
  const navigate = useNavigate(); 

  const { setRole } = useRole();
  
    //셀러 정보 가져오기
  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? {Authorization: `Bearer ${token}`} : {})
          },
          credentials: 'include'
        });
        const data = await res.json().catch(() => null);
        const u = data?.user || data;

        if (u && u.petshopName) {
          setUser(u);
          try { localStorage.setItem('user', JSON.stringify(u)); 
          } catch (e) {/* ignore */ }
        } else {
          setUser(null);
        }
      } catch(err) {
        setUser(null);
      }
    };
    load();
}, []);

  // 미처리 주문 개수 가져오기 (실시간 폴링)
  useEffect(() => {
    if (!user || !user._id) return;

    const loadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/orders/mine/count`, {
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}) 
          },
          credentials: 'include'
        });
        const data = await res.json().catch(() => null);
        
        if (res.ok && data?.count >= 0) {
          setOrderCount(data.count);
          console.log(`✅ Seller order count: ${data.count}`); // ✅ 디버깅
        }
      } catch (e) {
        console.debug('❌ load seller order count failed', e);
      }
    };

    loadCount(); // 초기 로드

    //  10초마다 주문 개수 갱신 (실시간 폴링)
    const interval = setInterval(loadCount, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/users/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      });
      // ignore logout 404 (server might not implement /api/logout)
      if (!res.ok && res.status !== 404) {
        console.warn('Logout returned', res.status);
      }
    } catch (e) {
      console.warn('Logout network error', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const petshopName = user?.petshopName || 'Seller';

  return (
      <div className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 font-medium">
          <div className="flex items-center gap-4">
            <Link to='/sellers'><img src={assets.logo} className="w-36" alt="Logo" /></Link>
            <h1 className="inline-flex items-center gap-2 bg-[#2563EB] text-white font-medium px-3 sm:px-4 py-1 rounded-full shadow-sm text-sm sm:text-lg">
              Hello, {petshopName}
            </h1>
          </div>
  
          {/* Desktop Menu */}
          <ul className="hidden sm:flex gap-8 text-xl text-gray-700">
            {["MY PRODUCTS", "ORDERS", "ALL PRODUCTS", "SELLERS", "ABOUT", "CONTACT"].map((item) => {
              let path = "";
  
              if (item === "MY PRODUCTS") path = "/myproducts";
              else if (item === "ORDERS") path = "/myorders";
              else if (item === "ALL PRODUCTS") path = "/products";
              else if (item === "SELLERS") path = "/seller-list";
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

          <div className='flex items-center gap-6'>
            {/* Profile */}
            <div className='group relative'>

                <Link to='/seller-profile'><img className='w-8 cursor-pointer' src={assets.profile_icon} alt=""/></Link>
                <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
                    <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
                        <p className='cursor-pointer hover:text-black' onClick={() => navigate('/seller-profile')}>My profile</p>
                        <p className='cursor-pointer hover:text-black' onClick={handleLogout}>Logout</p>

                    </div>
                </div>
            </div>

            {/* New Order */}
            <Link to='/myorders' className='relative'>
                <img src={assets.neworder_icon} className='w-8 min-w-5' alt=""/>
                 {orderCount > 0 ? (
                  <p className='absolute -top-2 -right-2 min-w-[20px] h-5 px-1 flex items-center justify-center bg-blue-600 text-white text-xs rounded-full font-semibold'>
                    {orderCount}
                    </p>
                ) : (
                  <p className='absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs rounded-full'>
                    0
                    </p>
                )}
                </Link>
          </div>

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
