import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import ProductsTitle from '../components/ProductsTitle';
import { assets } from '../assets/assets';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Orders = () => {
  const { products, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch client orders from server
  const fetchClientOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('⚠️ No token, loading from localStorage only');
        try {
          const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
          setOrders(localOrders);
        } catch (e) {
          setOrders([]);
        }
        setLoading(false);
        return;
      }

      console.log('🔄 Fetching orders from /api/orders/client...');
      const res = await axios.get(`${API_BASE}/api/orders/client`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      console.log('✅ /api/orders/client response:', res.data);

      if (res.data?.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
        
        // Save to localStorage as backup
        try {
          localStorage.setItem('orders', JSON.stringify(res.data.orders));
        } catch (e) {}
      } else {
        // Fallback to localStorage
        try {
          const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
          setOrders(localOrders);
        } catch (e) {
          setOrders([]);
        }
      }
    } catch (err) {
      console.error('❌ fetchClientOrders error:', err);
      
      // Fallback to localStorage
      try {
        const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        setOrders(localOrders);
      } catch (e) {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientOrders();

    // Poll every 10 seconds for status updates
    const interval = setInterval(fetchClientOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Convert old format items (object) to array
  const convertOrderItems = (itemsObj) => {
    if (Array.isArray(itemsObj)) return itemsObj;
    if (!itemsObj || typeof itemsObj !== 'object') return [];
    
    const out = [];
    for (const productId in itemsObj) {
      const opts = itemsObj[productId] || {};
      for (const optKey in opts) {
        const qty = opts[optKey];
        if (!qty) continue;
        out.push({ 
          _id: productId, 
          option: { weight: optKey, quantity: optKey }, 
          quantity: qty 
        });
      }
    }
    return out;
  };

  // Get product image safely
  const getProductImage = (item) => {
    // Try product snapshot first
    const product = item.product || item.productSnapshot || item._product;
    
    if (product?.image) {
      if (Array.isArray(product.image)) return product.image[0];
      if (typeof product.image === 'string') return product.image;
    }

    // Try to find in products context
    const contextProduct = products?.find(p => String(p._id) === String(item._id));
    if (contextProduct?.image) {
      if (Array.isArray(contextProduct.image)) return contextProduct.image[0];
      if (typeof contextProduct.image === 'string') return contextProduct.image;
    }

    return assets.placeholder_image || null;
  };

  // Get product details
  const getProductDetails = (item) => {
    const product = item.product || item.productSnapshot || item._product;
    const contextProduct = products?.find(p => String(p._id) === String(item._id));
    
    const merged = { ...(contextProduct || {}), ...(product || {}) };
    
    return {
      name: merged.name || merged.title || 'Product',
      price: item.price || merged.price || 0,
      image: getProductImage(item),
      option: item.option
    };
  };

  // Status badge styles
  const getStatusClass = (status) => {
    const statusMap = {
      new: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-indigo-100 text-indigo-800',
      'out-for-delivery': 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className='border-t pt-14 px-4 sm:px-8 lg:px-20 min-h-[60vh] flex items-center justify-center'>
        <p className='text-gray-600'>Loading orders...</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className='border-t pt-14 px-4 sm:px-8 lg:px-20 min-h-[60vh]'>
        <div className='text-2xl mb-8'>
          <ProductsTitle text1={'MY'} text2={'ORDERS'} />
        </div>
        <div className='text-center mt-20'>
          <p className='text-gray-600 text-lg mb-4'>No orders yet</p>
          <button 
            onClick={() => navigate('/products')} 
            className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='border-t pt-14 px-4 sm:px-8 lg:px-20 min-h-[80vh]'>
      <div className='text-2xl mb-8'>
        <ProductsTitle text1={'MY'} text2={'ORDERS'} />
      </div>

      <div className='flex flex-col gap-6'>
        {orders.map((order, idx) => {
          const orderId = order._id || order.id;
          const orderItems = convertOrderItems(order.items);

          return (
            <div 
              key={orderId || idx} 
              className='flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all'
            >
              {/* Order Info */}
              <div className='flex items-start gap-4 text-sm sm:text-base'>
                <div>
                  <p className='font-medium text-base sm:text-lg'>
                    Order #{orderId ? String(orderId).slice(-6) : idx + 1}
                  </p>
                  <p className='mt-1 text-sm text-gray-500'>
                    Date: <span className='text-gray-400'>
                      {new Date(order.date || order.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                  </p>
                  <p className='mt-2 text-sm'>
                    Status: <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(order.status)}`}>
                      {order.status || 'pending'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Items */}
              <div className='flex-1'>
                <div className='grid grid-cols-1 gap-3'>
                  {orderItems.map((item, i) => {
                    const details = getProductDetails(item);

                    return (
                      <div key={i} className='flex items-center justify-between border rounded p-3 bg-slate-50'>
                        <div className='flex items-center gap-4'>
                          {details.image ? (
                            <img 
                              src={details.image} 
                              alt={details.name} 
                              className='w-16 h-16 object-cover rounded'
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = assets.placeholder_image;
                              }}
                            />
                          ) : (
                            <div className='w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400'>
                              No image
                            </div>
                          )}
                          <div>
                            <p className='font-medium'>{details.name}</p>
                            <p className='text-sm text-gray-500'>
                              {details.option?.weight || details.option?.quantity || ''}
                            </p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-semibold'>{currency}{details.price}</p>
                          <p className='text-sm text-gray-500'>Qty: {item.quantity || 1}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className='flex flex-col items-end gap-2 md:w-48'>
                <p className='font-semibold text-lg'>{currency}{order.amount}</p>
                <button
                  onClick={() => {
                    if (!orderId) {
                      alert('Cannot track this order: missing order ID');
                      return;
                    }
                    navigate(`/track/${orderId}`, { state: { orderId } });
                  }}
                  className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition'
                >
                  Track Order
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;