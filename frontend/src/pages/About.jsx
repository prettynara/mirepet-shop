import React from 'react'
import ProductsTitle from './../components/ProductsTitle';
import { assets } from '../assets/assets'; 
import NewsletterBox from './../components/NewsletterBox';
import Title from './../components/Title';

const About = () => {
  return (
    <div>

      {/* Title */}
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT'} text2={'US'} />
      </div>
      
      {/* Intro */}
      <div className='my-2 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600 leading-relaxed'>
        <p>At <span className="font-semibold text-blue-600">Mirepet</span>, we believe that pets are family — and they deserve the very best.
Our mission is to create a trusted ecosystem where every pet owner can find what they need in one place, from essential supplies to professional veterinary care.</p>
        <p>Mirepet is built on two main pillars:</p>

        {/* Mirepet Shop */}
        <div className="pl-6 border-l-4 border-blue-200">
        <b className='text-gray-800 text-lg block mb-1'>Mirepet Shop</b>
        <p>A one-stop online marketplace that brings together pet-related stores and products. From food and accessories to toys and grooming essentials, pet owners can easily browse, compare, and order everything their pets need, all in one convenient platform.</p>
        </div>
        
        {/* Mirepet Vet */}
        <div className="pl-6 border-l-4 border-green-200">
        <b className='text-gray-800 text-lg block mb-1'>Mirepet Vet</b>
        <p>A dedicated platform designed to connect pet owners with veterinary services. Pet parents can register their pets, access medical history, and book veterinary appointments with ease. Veterinarians, in turn, can use the platform to securely review pet information and provide better, personalized care.</p>
        </div>
        
        <p>Together, Mirepet Shop and Mirepet Vet reflect our vision: making pet ownership easier, healthier, and more joyful. Whether it’s shopping for essentials or ensuring the best healthcare, Mirepet is here to support both pets and the people who love them.</p>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className='text-center text-xl py-6'>
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-20'>
        <div className='border rounded-xl px-10 md:px-12 py-10 flex flex-col gap-4 shadow-sm hover:shadow-md transition'>
          <b>All-in-One Platform:</b>
          <p className='text-gray-600'>One trusted platform for both pet care and supplies.</p>
      </div>
        <div className='border rounded-xl px-10 md:px-12 py-10 flex flex-col gap-4 shadow-sm hover:shadow-md transition'>
          <b>Trusted & Personalized Care:</b>
          <p className='text-gray-600'>Personalized services backed by veterinary professionals.</p>
      </div>    
        <div className='border rounded-xl px-10 md:px-12 py-10 flex flex-col gap-4 shadow-sm hover:shadow-md transition'>
          <b>Convenience & Community:</b>
          <p className='text-gray-600'>Convenient, reliable, and built for pet-loving families.</p>
        </div>
      </div>

      <NewsletterBox />

    </div>
  )
}

export default About
