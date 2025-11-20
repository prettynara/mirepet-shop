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
  
  const userId = localStorage.getItem('userId') || 'guest';
  const deliveryKey = `deliveryInfo_${userId}`;

  const [method, setMethod] = useState('cod');
  const [formData, setFormData] = useState({
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
    const loadDeliveryInfo = async () => {
      const token = localStorage.getItem('token');
      if (token && userId !== 'guest') {
        try {
          const res = await axios.get(`${API_BASE}/api/users/me/delivery-info`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          });
          if (res.data?.success && res.data.deliveryInfo) {
            setFormData(prev => ({ ...prev, ...res.data.deliveryInfo }));
            localStorage.setItem(deliveryKey, JSON.stringify(res.data.deliveryInfo));
            return;
          }
        } catch (e) {
          console.debug('Failed to load delivery info from server', e?.message);
        }
      }
      try {   
        const stored = JSON.parse(localStorage.getItem(deliveryKey) || '{}');
        if (Object.keys(stored).length > 0) setFormData(prev => ({ ...prev, ...stored }));
      } catch (e) {}
    };
    loadDeliveryInfo();
  }, [userId, deliveryKey]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        const sellerId = prod.seller || prod.sellerId || prod.owner || prod.vendor || null;
        const productSnapshot = {
          _id: productId,
          name: prod.name || prod.title || '',
          image: Array.isArray(prod.image) ? prod.image : (typeof prod.image === 'string' && prod.image ? [prod.image] : []),
          options: prod.options || [],
          price,
          seller: sellerId
        };
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
      localStorage.setItem(deliveryKey, JSON.stringify(formData)); // ✅ deliveryKey 사용
    } catch (e) {}

    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      const clientId = storedUser?._id || storedUser?.id;
      const token = localStorage.getItem('token');
      if (clientId && token) {
        await fetch(`${API_BASE}/api/users/client/${clientId}`, { // ✅ /api/users/client/:id
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          credentials: 'include',
          body: JSON.stringify({
            address: [formData.street, formData.city, formData.state, formData.zipcode, formData.country].filter(Boolean).join(' '),
            phone: formData.phone || ''
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
      deliveryInfo: formData, // ✅ delivery → formData
      paymentMethod: method
    };

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

    if (Array.isArray(createdOrders) && createdOrders.length) {
      createdOrders.forEach(o => placeOrder(o));
    } else {
      const clientOrder = {
        id: Date.now(),
        items: itemsArray,
        amount: payload.amount,
        date: new Date().toISOString(),
        status: 'pending',
        deliveryInfo: formData, // ✅ delivery → formData
        paymentMethod: method
      };
      placeOrder(clientOrder);
      try {
        const existing = JSON.parse(localStorage.getItem('orders') || '[]');
        existing.unshift(clientOrder);
        localStorage.setItem('orders', JSON.stringify(existing));
      } catch (e) {}
    }

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
            <input name="firstName" value={formData.firstName} onChange={onChangeHandler} className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='First name'/>
            <input name="lastName" value={formData.lastName} onChange={onChangeHandler} className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='Last name'/>
          </div>
          <input name="email" value={formData.email} onChange={onChangeHandler} className='border border-gray-300 rounded px-3.5 py-2 w-full mb-3' type="email" placeholder='Email address'/>
          <input name="street" value={formData.street} onChange={onChangeHandler} className='border border-gray-300 rounded px-3.5 py-2 w-full mb-3' type="text" placeholder='Street'/>
          <div className='flex gap-3 mb-3'>
            <input name="city" value={formData.city} onChange={onChangeHandler} className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='City'/>
            <input name="state" value={formData.state} onChange={onChangeHandler} className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='State'/>
          </div>
          <div className='flex gap-3 mb-3'>
            <input name="zipcode" value={formData.zipcode} onChange={onChangeHandler} className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='Zipcode'/>
            <input name="country" value={formData.country} onChange={onChangeHandler} className='border border-gray-300 rounded px-3.5 py-2 w-full' type="text" placeholder='Country'/>
          </div>
          <input name="phone" value={formData.phone} onChange={onChangeHandler} className='border border-gray-300 rounded px-3.5 py-2 w-full mb-3' type="tel" placeholder='Phone'/>
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