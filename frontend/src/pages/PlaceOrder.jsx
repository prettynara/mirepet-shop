import React, { useContext, useEffect, useState } from 'react';
import ProductsTitle from '../components/ProductsTitle';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/assets';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const { placeOrder, cartItems, getCartAmount, updateQuantity, clearCart, products } = useContext(ShopContext);
  const [method, setMethod] = useState('cod');

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

  useEffect(() => {
    const load = async () => {
      try {
        const stored = localStorage.getItem('deliveryInfo');
        if (stored) {
          setDelivery(JSON.parse(stored));
          return;
        }
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

  const buildItemsArray = () => {
    const items = [];
    for (const productId in cartItems) {
      const opts = cartItems[productId] || {};
      for (const optKey in opts) {
        const qty = Number(opts[optKey] || 0);
        if (!qty) continue;
        const prod = (products || []).find(p => String(p._id) === String(productId)) || {};
        const option = prod.options?.find(o => String(o.weight) === String(optKey) || String(o.quantity) === String(optKey)) || {};
        const price = option?.sale_price && option.sale_price < option.price ? option.sale_price : option?.price || prod.price || 0;

        // determine seller id from possible fields
        const sellerId = prod.seller || prod.sellerId || prod.owner || prod.vendor || null;

        // include product snapshot so Orders can render even if products context is missing
        const productSnapshot = {
          _id: productId,
          name: prod.name || prod.title || '',
          image: Array.isArray(prod.image) ? prod.image : (typeof prod.image === 'string' && prod.image ? [prod.image] : []),
          options: prod.options || [],
          price,
          seller: sellerId
        };
        
        // broaden seller candidate keys (backend product may store seller under different key)
        items.push({
          _id: productId,
          seller: sellerId,
          option: { weight: optKey, quantity: optKey },
          quantity: qty,
          price,
          product: productSnapshot,
        });
      }
    }
    return items;
  };

  const handlePlaceOrder = async () => {
    try {
      localStorage.setItem('deliveryInfo', JSON.stringify(delivery));
    } catch (e) {}

    // attempt to persist client contact/address if logged in
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
            address: [delivery.street, delivery.city, delivery.state, delivery.zipcode, delivery.country].filter(Boolean).join(' '),
            phone: delivery.phone || ''
          })
        }).catch(() => {});
      }
    } catch (e) {}

    const itemsArray = buildItemsArray();
    if (!itemsArray.length) {
      alert('Cart is empty');
      return;
    }

    const payload = {
      items: itemsArray,
      amount: getCartAmount(),
      deliveryInfo: delivery,
      paymentMethod: method
    };

    // POST to backend to create seller-split orders; fallback to local-only if API fails
    let createdOrders = null;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/api/orders`, payload, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        withCredentials: true
      });
      if (res.data?.orders) {
        createdOrders = res.data.orders;
      }
    } catch (err) {
      console.warn('Order API failed, will persist locally', err);
    }

    // For UI state: create local order entries (use server-created if available)
    if (Array.isArray(createdOrders) && createdOrders.length) {
      createdOrders.forEach(o => placeOrder(o));
    } else {
      // create a client-side order that will appear in Orders page
      const clientOrder = {
        id: Date.now(),
        items: itemsArray,
        amount: payload.amount,
        date: new Date().toISOString(),
        status: 'pending',
        deliveryInfo: delivery,
        paymentMethod: method
      };
      placeOrder(clientOrder);
      // also store locally in localStorage.orders for Orders page fallback
      try {
        const existing = JSON.parse(localStorage.getItem('orders') || '[]');
        existing.unshift(clientOrder);
        localStorage.setItem('orders', JSON.stringify(existing));
      } catch (e) {}
    }

    // clear cart
    try {
      if (typeof clearCart === 'function') clearCart();
      else {
        for (const productId in cartItems) {
          const opts = cartItems[productId] || {};
          for (const optKey in opts) updateQuantity(productId, optKey, 0);
        }
      }
      try {
        localStorage.removeItem('cart');
        localStorage.removeItem('cartItems');
      } catch (e) {}
    } catch (e) {}

    navigate('/orders');
  };

  return (
    <div className='flex flex-col sm:flex-row justify-between gap-8 pt-8 sm:pt-14 min-h-[80vh] border-t px-4 sm:px-8 lg:px-20'>
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

      <div className='w-full sm:max-w-[500px] flex flex-col gap-8'>
        <div className='bg-gray-50 p-6 rounded-xl shadow'>
          <CartTotal />
        </div>

        <div className='bg-white p-6 rounded-xl shadow'>
          <ProductsTitle text1={'PAYMENT'} text2={'METHOD'} />
          <div className='flex flex-col lg:flex-row gap-4 mt-4'>
            <div onClick={()=>setMethod('card')} className={`flex items-center gap-3 border p-3 px-4 rounded-lg cursor-pointer transition ${ method === 'card' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400' }`}>
              <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'card' ? 'bg-green-400' : ''}`}></p>
              <img className='h-6 mx-3' src={assets.card_logo} alt="" />
              <p className="text-sm text-gray-600 font-medium">Credit / Debit Card</p>
            </div>
            <div onClick={()=>setMethod('cod')} className={`flex items-center gap-3 border p-3 px-4 rounded-lg cursor-pointer transition ${ method === 'cod' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400' }`}>
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
  );
};

export default PlaceOrder;