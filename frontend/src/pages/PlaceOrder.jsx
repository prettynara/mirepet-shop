import React, { useContext, useState } from 'react'
import ProductsTitle from '../components/ProductsTitle'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'; 
import { ShopContext } from '../context/ShopContext';

const PlaceOrder = () => {

  const [method, setMethod] = useState('cod');
  const {navigate, placeOrder, cartItems, getCartAmount} = useContext(ShopContext);

  const handlePlaceOrder = () => {
    const newOrder = {
      id: Date.now(), // unique id
      items: cartItems,
      amount: getCartAmount(),
      date: new Date().toLocaleDateString(),
      status: "pending"
    };
    placeOrder(newOrder);
    navigate('/orders');
  };

  return (
    <div className='flex flex-col sm:flex-row justify-between gap-8 pt-8 sm:pt-14 min-h-[80vh] border-t px-4 sm:px-8 lg:px-20'>
      
      {/* left side: Deliver Info*/}
      <div className='w-full sm:max-w-[500px]'>
        <div className='bg-white rounded-xl shadow p-6'>
          <div className='mb-6'>
          <ProductsTitle text1={'DELIVERY'} text2={'INFORMATION'} />
      
        </div>
        <div className='flex gap-3 mb-3'>
          <input className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='First name'/>
          <input className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='Last name'/>
        </div>
          <input className='border border-gray-300 rounded px-3.5 py-2 w-full mb-3' type="email" placeholder='Email address'/>
          <input className='border border-gray-300 rounded px-3.5 py-2 w-full mb-3' type="email" placeholder='Street'/>
        <div className='flex gap-3 mb-3'>
          <input className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='City'/>
          <input className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='State'/>
        </div>
        <div className='flex gap-3 mb-3'>
          <input className='border border-gray-300 rounded px-3.5 py-2 w-full' type="number" placeholder='Zipcode'/>
          <input className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='Country'/>
        </div>
          <input className='border border-gray-300 rounded px-3.5 py-2 w-full' type="number" placeholder='Phone'/>
      </div>
      </div>

      {/* right isde : Cart + Payment */}
      <div className='w-full sm:max-w-[500px] flex flex-col gap-8'>

        {/* Cart Total */}
        <div className='bg-gray-50 p-6 rounded-xl shadow'>
            <CartTotal />
        </div>

        {/* Payment */}
        <div className='bg-white p-6 rounded-xl shadow'>
          <ProductsTitle text1={'PAYMENT'} text2={'METHOD'} />

          {/* Payment Method Selection */}
          <div className='flex flex-col lg:flex-row gap-4 mt-4'>
              <div onClick={()=>setMethod('card')} className={`flex items-center gap-3 border p-3 px-4 rounded-lg cursor-pointer transition ${
                method === 'card' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
              }`}>
                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'card' ? 'bg-green-400' : ''}`}></p>
                <img className='h-6 mx-3' src={assets.card_logo} alt="" />
                <p className="text-sm text-gray-600 font-medium">Credit / Debit Card</p>
              </div>
              <div onClick={()=>setMethod('cod')} className={`flex items-center gap-3 border p-3 px-4 rounded-lg cursor-pointer transition ${
                method === 'card' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
              }`}>
                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                <p className='text-gray-600 text-sm font-medium mx-2'>CASH ON DELIVERY</p>
              </div>
          </div>
          <div className='w-full text-end mt-8'>
              <button onClick={handlePlaceOrder} className='bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-10 py-3 rounded-xl shadow-md shadow-blue-200 hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-300 ease-in-out'>PLACE ORDER</button>
          </div>
        </div>

      </div>

    </div>
  )
}

export default PlaceOrder
