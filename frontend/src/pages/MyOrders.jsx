import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductsTitle from "../components/ProductsTitle";
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const statusButtons = [
  { label: "Mark Ready", value: "ready", color: "bg-yellow-400 text-white" },
  { label: "Out for Delivery", value: "out-for-delivery", color: "bg-blue-500 text-white" },
  { label: "Mark Delivered", value: "delivered", color: "bg-green-500 text-white" },
  { label: "Out of Stock", value: "out-of-stock", color: "bg-red-500 text-white" }
];

const colorMap = {
  new: "bg-gray-300 text-gray-800",
  pending: "bg-indigo-400 text-white",
  ready: "bg-yellow-400 text-white",
  "out-for-delivery": "bg-blue-500 text-white",
  delivered: "bg-green-500 text-white",
  "out-of-stock": "bg-red-500 text-white",
  cancelled: "bg-gray-500 text-white"
};

const MyOrders = () => {
  const { currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localFallbackLoaded, setLocalFallbackLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/api/orders/mine`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          withCredentials: true
        });
        if (res.data?.orders) {
          setOrders(res.data.orders);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.debug('Failed to load seller orders from API', e);
      }

      // fallback to localStorage orders for non-seller or dev
      try {
        const local = JSON.parse(localStorage.getItem('orders') || '[]');
        if (Array.isArray(local) && local.length) setOrders(local);
        setLocalFallbackLoaded(true);
      } catch (e) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatusChangeRemote = async (orderId, statusValue) => {
    // optimistic UI update
    setOrders(prev => prev.map(o => (o._id === orderId || o.id === orderId ? { ...o, status: statusValue } : o)));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE}/api/orders/${orderId}/status`, { status: statusValue }, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        withCredentials: true
      });
      if (res.data?.order) {
        setOrders(prev => prev.map(o => (o._id === orderId ? res.data.order : o)));
      }
    } catch (e) {
      console.warn('Failed to update order status remotely', e);
      // if remote failed and we are using local fallback, persist change locally
      try {
        const local = JSON.parse(localStorage.getItem('orders') || '[]');
        const updated = local.map(o => (o._id === orderId || o.id === orderId ? { ...o, status: statusValue } : o));
        localStorage.setItem('orders', JSON.stringify(updated));
      } catch (err) {}
    }
  };

  if (loading) return <div className="pt-20 px-4">Loading orders...</div>;

  return (
    <div className="border-t pt-14 px-4 sm:px-8 lg:px-20 min-h-[80vh]">
      <div className="text-2xl mb-8">
        <ProductsTitle text1="MY" text2="ORDERS" />
      </div>

      <div className="flex flex-col gap-6">
        {orders.length === 0 && <div className="text-gray-600">No orders found.</div>}

        {orders.map((order, index) => {
          const firstItem = (order.items && order.items[0]) || {};
          const prod = firstItem.productSnapshot || firstItem.product || {};
          const imgUrl = Array.isArray(prod?.image) && prod.image.length
            ? prod.image[0]
            : (typeof prod?.image === 'string' && prod.image.trim() ? prod.image.trim() : null);
          const option = firstItem.option || {};
          const price = firstItem.price ?? prod?.price ?? 0;
          const currentStatus = order.status || 'new';
          const displayId = order._id ? order._id.slice(-6) : (order.id || index);

          return (
            <div key={order._id || order.id || index} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-lg">Order #{displayId}</p>
                  <span className={`px-4 py-1.5 rounded text-sm font-medium opacity-90 cursor-default ${colorMap[currentStatus] || ''}`}>
                    {currentStatus}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{new Date(order.date || order.createdAt || Date.now()).toLocaleString()}</p>
              </div>

              <div className="flex items-start gap-4">
                {imgUrl ? (
                  <img className="w-20 h-20 object-cover rounded-md" src={imgUrl} alt={prod?.name || ''} />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">No image</div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-base sm:text-lg">{prod?.name || firstItem.name || 'Product'}</p>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <p className="font-semibold">{currency}{price}</p>
                    <span className="px-2 py-1 border rounded bg-slate-50">Qty: {firstItem.quantity || 1}</span>
                    <span className="px-2 py-1 border rounded bg-slate-50">{option?.weight || option?.quantity || ''}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                {order.deliveryInfo?.firstName || order.deliveryInfo?.name ? (
                  <>
                    <p><span className="font-medium">Customer:</span> {order.deliveryInfo?.firstName ? `${order.deliveryInfo.firstName} ${order.deliveryInfo.lastName || ''}` : order.deliveryInfo?.name}</p>
                    <p><span className="font-medium">Address:</span> {order.deliveryInfo?.street || order.deliveryInfo?.address || '—'}</p>
                    <p><span className="font-medium">Phone:</span> {order.deliveryInfo?.phone || '—'}</p>
                  </>
                ) : (
                  <>
                    <p><span className="font-medium">Customer:</span> {order.client || 'Guest'}</p>
                    <p><span className="font-medium">Address:</span> {order.deliveryInfo?.street || '—'}</p>
                  </>
                )}
              </div>

              <div className="mt-4 flex gap-3 flex-wrap">
                {statusButtons.map((s, i) => {
                  const isActive = currentStatus === s.value;
                  return (
                    <button
                      key={i}
                      onClick={() => handleStatusChangeRemote(order._id || order.id, s.value)}
                      className={`${s.color} ${isActive ? 'ring-4 ring-offset-2 ring-gray-300' : ''} px-4 py-2 rounded text-white text-sm transition`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;