import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Login = () => {

  const [currentState, setCurrentState] =useState('Sign Up');
  const [role, setRole] = useState('guest'); // 기본값: guest
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
      event.preventDefault();

      if (currentState === 'Sign Up') {
      // 회원가입 후 role에 따라 추가정보 페이지로 이동
      if (role === 'customer') {
        navigate('/customer-info');
      } else if (role === 'seller') {
        navigate('/seller-info');
      }
    } else {
      // 로그인 로직 (추후 백엔드 연동)
      console.log('로그인 처리');
      if (role === 'customer') navigate('/Home');
      else if (role === 'seller') navigate('/seller/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/'); // guest 기본 페이지
      }
    }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-20 gap-5 text-gray-800 bg-white p-8 rounded-xl shadow-md'>
        
        {/* Title */}
        <div className='flex items-center gap-4 mb-6 justify-center'>
          <p className='fredoka-regular text-3xl font-semibold'>{currentState}</p>
          <hr className='h-[2px] w-10 bg-gray-800 border-none rounded' />
        </div>

        {/* Input Fields */}
        {currentState === 'Login' ? '' :<input type="text" className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Name' required />}
        <input type="email" className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Email' required />
        <input type="password" className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500' placeholder='Paswword' required />
        
        {/* Role 선택 (회원가입일 때만 표시) */}
        {currentState === 'Sign Up' && (
          <div className="w-full flex justify-between text-sm text-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="customer"
                checked={role === 'customer'}
                onChange={() => setRole('customer')}
              />
              Customer
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="seller"
                checked={role === 'seller'}
                onChange={() => setRole('seller')}
              />
              Petshop Seller
            </label>
          </div>
        )}  

        {/* Links */}
        <div className='w-full flex justify-between text-sm text-gray-600 mt-[-4px]'>
          <p className='cursor-pointer hover:text-blue-600'>Forgot your password?</p>
          {
            currentState === 'Login'
            ? <p onClick={()=>setCurrentState('Sing Up')} className='cursor-pointer hover:text-blue-600'>Create account</p>
            : <p onClick={()=>setCurrentState('Login')} className='cursor-pointer hover:text-blue-600'>Login Here</p>
          }
        </div>

        {/* Submit Button */}
        <button className='bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium px-8 py-2 mt-4 rounded-lg shadow-sm hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-300 ease-in-out'>{currentState === 'Login' ? 'Sign In' : 'Sign up'}</button>
    </form>
  )
}

export default Login
