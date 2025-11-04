import React, { useContext, useEffect, useState } from 'react'
import ProductsTitle from '../components/ProductsTitle'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'; 
import { ShopContext } from '../context/ShopContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const PlaceOrder = () => {

  const [method, setMethod] = useState('cod');
  const {navigate, placeOrder, cartItems, getCartAmount, updateQuantity, clearCart } = useContext(ShopContext);

  //delivery info state (persisted)
  const [delivery, setDelivery] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    phone: ''
  });

  // load saved info from localStorage or from /api/me (if logged in)
  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem('deliveryInfo');
        if (stored) {
          setDelivery(JSON.parse(stored));
          return;
        }
        // try backend user info
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/me`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          credentials: 'include'
        });
        if (!res.ok) return;
        const data = await res.json();
        const user = data?.user;
        if (user) {
          setDelivery(prev => ({
            ...prev,
            firstName: user.name ? user.name.split(' ')[0] : prev.firstName,
            lastName: user.name ? user.name.split(' ').slice(1).join(' ') : prev.lastName,
            email: user.email || prev.email,
            street: user.address || prev.street,
            phone: user.phone || prev.phone
          }));
        }
      } catch (err) {
        console.debug('load deliveryInfo failed', err);
      }
    };
    load();
  }, []);

  const handleChange = (key, value) => {
    setDelivery(prev => ({ ...prev, [key]: value }));
  };

  const handlePlaceOrder = async () => {
    // save delivery into locally
    try {
      localStorage.setItem('deliveryInfo', JSON.stringify(delivery));
    } catch (e) {
      console.warn('Failed to save deliveryInfo', e);  
    }

    // try to persist to backend (user address/phone) if logged in
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      const clientId = storedUser?._id;
      const token = localStorage.getItem('token');
      if (clientId && token) {
        await fetch(`${API_BASE}/api/client/${clientId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            address: delivery.street || delivery.city || delivery.state || delivery.zipcode || delivery.country ? 
              `${delivery.street} ${delivery.city} ${delivery.state} ${delivery.zipcode} ${delivery.country}`.trim() : '',
            phone: delivery.phone || ''
          })
        }).catch(err => {
          console.debug('persist delivery to server failed', err);
        });
      }
    } catch (err) {
      console.debug('error persisting delivery info', err);
    }

    // normalize cartItems (object) -> items array for orders
    const itemsArray = [];
    for (const productId in cartItems) {
      const opts = cartItems[productId];
      for (const optKey in opts) {
        const qty = opts[optKey];
        if (!qty) continue;
        itemsArray.push({
          _id: productId,
          option: { weight: optKey, quantity: optKey },
          quantity: qty
        });
      }
    }

    const newOrder = {
      id: Date.now(), // unique id
      items: itemsArray,
      amount: getCartAmount(),
      date: new Date().toISOString(),
      status: "pending",
      deliveryInfo: delivery,
      paymentMethod: method
    };
    // update app state (if ShopContext handles it)
    placeOrder(newOrder);

    // clear cart: prefer clearCart() if provided, otherwise zero each item via updateQuantity
    try {
      if (typeof clearCart === 'function') {
        clearCart();
      } else if (typeof updateQuantity === 'function') {
        for (const productId in cartItems) {
          const opts = cartItems[productId] || {};
          for (const optKey in opts) {
            const qty = opts[optKey];
            if (!qty) continue;
            updateQuantity(productId, optKey, 0);
          }
        }
      }
      // also remove common localStorage keys if present
      try {
        localStorage.removeItem('cart');
        localStorage.removeItem('cartItems');
      } catch (e) { /* ignore */ }
    } catch (e) {
      console.warn('Failed to clear cart after order', e);
    }

    //persist orders llocally so Orders page can load them across sessions
    try {
      const existing = JSON.parse(localStorage.getItem('orders') || '[]');
      // keep newest first
      existing.unshift(newOrder);
      localStorage.setItem('orders', JSON.stringify(existing));
    } catch (e) {
      console.warn('Failed to save orders', e);  
    }

    // go to orders page
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
            <input value={delivery.firstName} onChange={(e)=>handleChange('firstName', e.target.value)} className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='First name'/>
            <input value={delivery.lastName} onChange={(e)=>handleChange('lastName', e.target.value)} className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='Last name'/>
          </div>
          <input value={delivery.email} onChange={(e)=>handleChange('email', e.target.value)} className='border border-gray-300 rounded px-3.5 py-2 w-full mb-3' type="email" placeholder='Email address'/>
          <input value={delivery.street} onChange={(e)=>handleChange('street', e.target.value)} className='border border-gray-300 rounded px-3.5 py-2 w-full mb-3' type="text" placeholder='Street'/>
          <div className='flex gap-3 mb-3'>
            <input value={delivery.city} onChange={(e)=>handleChange('city', e.target.value)} className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='City'/>
            <input value={delivery.state} onChange={(e)=>handleChange('state', e.target.value)} className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='State'/>
          </div>
          <div className='flex gap-3 mb-3'>
            <input value={delivery.zipcode} onChange={(e)=>handleChange('zipcode', e.target.value)} className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='Zipcode'/>
            <input value={delivery.country} onChange={(e)=>handleChange('country', e.target.value)} className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='Country'/>
          </div>
          <input value={delivery.phone} onChange={(e)=>handleChange('phone', e.target.value)} className='border border-gray-300 rounded px-3.5 py-2 w-full mb-3' type="tel" placeholder='Phone'/>
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
              <div onClick={()=>setMethod('card')} className={`flex items-center gap-3 border p-3 px-4 rounded-lg cursor-pointer transition ${ method === 'card' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400' }`}>
                <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'card' ? 'bg-green-400' : ''}`}></p>
                <img className='h-6 mx-3' src={assets.card_logo} alt="" />
                <p className="text-sm text-gray-600 font-medium">Credit / Debit Card</p>
              </div>
              <div onClick={()=>setMethod('cod')} className={`flex items-center gap-3 border p-3 px-4 rounded-lg cursor-pointer transition ${ method === 'card' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400' }`}>
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