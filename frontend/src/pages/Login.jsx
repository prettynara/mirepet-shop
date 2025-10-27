import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../context/RoleContext';

const Login = () => {
  const [currentState, setCurrentState] = useState('Sign Up');
  const [role, setRole] = useRole() // RoleContext에서 role 가져오기 
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const email = event.target[0].value;
    const password = event.target[1].value;

    if (currentState === 'Sign Up') {
      if (role === 'client') navigate('/customer-info');
      else if (role === 'seller') navigate('/seller-info');
    } else {
      console.log('로그인 처리');
      try {
        const res = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          header: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!data.success) {
          alert(data.message);
          return;
        }

      //RoleContext update
      setRole(data.role);

      // JWT 저장(선택, 새로고침 후 로그인 유지 가능)
      localStorage.setItem('token', data.token);

      // role별 화면 이동 
      if (role === 'client') navigate('/Home');
      else if (role === 'seller') navigate('/seller/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch(err) {
      console.error(err);
      alert('Login failed');
    }
  };
  }

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-16 gap-6 text-gray-800 bg-gradient-to-br from-blue-50 to-indigo-100 p-10 rounded-3xl shadow-xl"
    >
      {/* Title */}
      <div className="flex items-center gap-4 mb-6 justify-center">
        <p className="text-3xl font-bold text-indigo-700">{currentState}</p>
        <hr className="h-[2px] w-10 bg-gray-800 border-none rounded" />
      </div>

      {/* Input Fields */}
      {currentState === 'Sign Up' && (
        <input
          type="text"
          placeholder="Name"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          required
        />
      )}
      <input
        type="email"
        placeholder="Email"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        required
      />

      {/* Role 선택 (회원가입일 때만) */}
      {currentState === 'Sign Up' && (
        <div className="w-full flex justify-between text-base md:text-lg text-gray-700 mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="client"
              checked={role === 'client'}
              onChange={() => setRole('client')}
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
      <div className="w-full flex justify-between text-sm text-gray-600 mt-[-2px]">
        <p className="cursor-pointer hover:text-blue-600">Forgot your password?</p>
        {currentState === 'Login' ? (
          <p
            onClick={() => setCurrentState('Sign Up')}
            className="cursor-pointer hover:text-blue-600"
          >
            Create account
          </p>
        ) : (
          <p
            onClick={() => setCurrentState('Login')}
            className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
          >
            Login Here
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium px-8 py-3 mt-4 rounded-xl shadow-md hover:from-indigo-600 hover:to-indigo-700 active:scale-95 transition-transform duration-300"
      >
        {currentState === 'Login' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  );
};

export default Login;
