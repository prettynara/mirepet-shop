import React from 'react'
import { assets } from '../assets/assets'


const Hero = () => {
  return (
    <div className='flex flex-col sm:flex-row items-center rounded-2xl shadow-lg bg-gradient-to-r from-blue-50 to-white overflow-hidden'>
        {/* Hero Left Side */}
        <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
            <div className='text-[#2563EB] space-y-4'>
                <div className='flex items-center gap-2'>
                    <p className='w-8 md:w-11 h-[2px] bg-[#2563EB]'></p>
                    <p className='font-semibold text-sm md:text-base uppercase tracking-wide'>UP TO 50% DISCOUNT</p>
                </div>
                <h1 className='fredoka-regular text-4xl lg:text-6xl font-bold leading-snug text-gray-800'>Special Price</h1>
                <div className='flex items-center gap-3'>
                    <p className='bg-[#2563EB] text-white font-semibold px-5 py-2 rounded-full shadow hover:bg-blue-700 transition'>SHOP NOW</p>
                    <p className='w-40 md:w-44 h-[1.5px] bg-[#2563EB] rounded'></p>
                </div>
            </div>
        </div >
        {/* Hero Right Side */}
        <div className='w-full sm:w-1/2'>
            <img className='w-full h-full object-cover' src={assets.hero_img} alt=""/>
        </div>
    </div>
  )
}

export default Hero
