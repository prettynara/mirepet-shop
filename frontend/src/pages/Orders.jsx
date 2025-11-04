import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import ProductsTitle from '../components/ProductsTitle';

const Orders = () => {

  const { products, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);

  const convertOrderItems = (itemsObj) => {
  if (!itemsObj || typeof itemsObj !== 'object') return [];
  const out = [];
  for (const productId of Object.keys(itemsObj)) {
    const opts = itemsObj[productId] || {};
    for (const optKey of Object.keys(opts)) {
      const qty = opts[optKey];
      if (!qty) continue;
      out.push({ _id: productId, option: { weight: optKey, quantity: optKey }, quantity: qty });
    }
  }
  return out;
};

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('orders')) || [];
      setOrders(stored);
    } catch (e) {
      console.warn('Failed to load orders', e);
      setOrders([]);
    }
  }, []);

  if (!orders.length) {
    return (
      <div className='border-t pt-14 px-4 sm:px-8 lg:px-20 min-h-[60vh]'>
        <div className='text-2xl mb-8'>
          <ProductsTitle text1={'MY'} text2={'ORDERS'} />
        </div>
        <p className='text-gray-600'>You have no orders yet.</p>
      </div>
    );
  }

  return (
    <div className='border-t pt-14 px-4 sm:px-8 lg:px-20 min-h-[80vh]'>
      
      {/* Title */}
      <div className='text-2xl mb-8'>
        <ProductsTitle text1={'MY'} text2={'ORDERS'} />
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-6">
        {orders.map((order, idx) => (
          <div key={order.id || idx} className='flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all'>
            <div className='flex items-start gap-4 text-sm sm:text-base'>
              <div>
                <p className='font-medium text-base sm:text-lg'>Order #{order.id}</p>
                <p className='mt-1 text-sm text-gray-500'>Date: <span className='text-gray-400'>{new Date(order.date).toLocaleString()}</span></p>
                <p className='mt-2 text-sm text-gray-600'>Status: <strong className='text-green-600'>{order.status}</strong></p>
              </div>
            </div>

            <div className='flex-1'>
              <div className='grid grid-cols-1 gap-3'>
                {(Array.isArray(order.items) ? order.items : convertOrderItems(order.items)).map((it, i) => {
                  const prod = products.find(p => p._id === it._id) || it;
                  const option = prod.options?.find(o => (o.weight || o.quantity) === (it.option?.weight || it.option?.quantity)) || it.option;
                  return (
                    <div key={i} className='flex items-center justify-between border rounded p-3 bg-slate-50'>
                      <div className='flex items-center gap-4'>
                        <img src={prod.image?.[0] || ''} alt='' className='w-16 h-16 object-cover rounded' />
                        <div>
                          <p className='font-medium'>{prod.name || prod.title || 'Product'}</p>
                          <p className='text-sm text-gray-500'>{option?.weight || option?.quantity || ''}</p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold'>{currency}{(option?.sale_price && option.sale_price < option.price) ? option.sale_price : option?.price}</p>
                        <p className='text-sm text-gray-500'>Qty: {it.quantity || 1}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className='flex flex-col items-end gap-2 md:w-48'>
              <p className='font-semibold'>{currency}{order.amount}</p>
              <button className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg'>Track Order</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;