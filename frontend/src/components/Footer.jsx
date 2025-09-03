import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-6">
      <div className='max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 text-sm text-gray-600'>

        {/* 회사 소개 */}
        <div>
            <img src={assets.logo} className='mb-5 w-32' alt="" />
            <p className='leading-relaxed'>
                Mirepet is all about the pet we offer two services about petshop and veterinarian, here as Mirepet shop, We gather and offer all the information for the pet shops!
            </p>
        </div>

        {/* 네비게이션 */}
        <div className='pl-36'>
            <p className='text-lg font-semibold text-gray-800 mb-4'>COMPANY</p>
            <ul className='flex flex-col gap-2'>
                <li className='hover:text-blue-600 cursor-pointer transition-colors'>Home</li>
                <li className='hover:text-blue-600 cursor-pointer transition-colors'>About us</li>
                <li className='hover:text-blue-600 cursor-pointer transition-colors'>About shops</li>
                <li className='hover:text-blue-600 cursor-pointer transition-colors'>Delivery</li>
                <li className='hover:text-blue-600 cursor-pointer transition-colors'>Privacy policy</li>
            </ul>
        </div>

        {/* 연락처 */}
         <div  className='pl-20'>
          <p className="text-lg font-semibold text-gray-800 mb-4">GET IN TOUCH</p>
          <ul className="flex flex-col gap-3">
            <li className="flex items-center gap-3">
              <img src={assets.phone_icon} alt="phone" className="w-5 h-5" />
              <span>+216 51 134 499 </span>
            </li>
            <li className="flex items-center gap-3">
              <img src={assets.mail_icon} alt="email" className="w-5 h-5" />
              <span>Mire.pawpet@gmail.com</span>
            </li>
            <li className="flex items-center gap-3">
              <img src={assets.location_icon} alt="location" className="w-5 h-5" />
              <span>Tunis, Tunisia</span>
            </li>
          </ul>
        </div>
      </div>

        {/* 하단 */}
        <div className="border-t border-gray-200">
        <p className="py-6 text-center text-xs text-gray-500"> © 2024 Mirepet. All rights reserved.</p>
      </div>

    </footer>
   
  )
}

export default Footer
