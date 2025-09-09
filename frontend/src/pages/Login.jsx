import React, { useState } from 'react'


const Login = () => {

  const [currentState, setCurrentState] =useState('Sign Up');

  const onSubmitHandler = async (event) => {
      event.preventDefault();
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
