import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductsTitle from '../components/ProductsTitle';
import { io as ioClient } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const STEP_ORDER = [
  { key: 'new', label: 'Ordered' },
  { key: 'pending', label: 'Packed' },
  { key: 'ready', label: 'Ready / Awaiting pickup' },
  { key: 'out-for-delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

const TrackOrder = () => {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // resolve order id from param / location.state / query
  const orderId = paramId || location.state?.orderId || new URLSearchParams(location.search).get('id');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  const fetchOrder = async () => {
    if (!orderId) {
      setError('Invalid order id');
      setOrder(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let res = null;
      try {
        res = await axios.get(`${API_BASE}/api/orders/${orderId}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          withCredentials: true,
        });
      } catch (e) {
        // fallback: fetch client orders and pick by id
        try {
          const r2 = await axios.get(`${API_BASE}/api/orders/client`, {
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            withCredentials: true,
          });
          const arr = r2.data?.orders || [];
          res = { data: { order: arr.find(o => String(o._id) === String(orderId)) || null } };
        } catch (e2) {
          throw e; // rethrow original
        }
      }
      const ord = res?.data?.order || res?.data || null;
      if (!ord) throw new Error('Order not found');
      setOrder(ord);
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load order');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const t = setInterval(fetchOrder, 10000);
    // socket realtime: join room and listen for updates
    if (orderId) {
      try {
        socketRef.current = ioClient(API_BASE, { withCredentials: true });
        socketRef.current.on('connect', () => {
          socketRef.current.emit('joinOrder', orderId);
        });
        socketRef.current.on('order:update', (updated) => {
          if (String(updated?._id) === String(orderId)) {
            setOrder(updated);
          }
        });
      } catch (e) { console.debug('socket connect failed', e?.message || e); }
    }
    return () => {
      clearInterval(t);
      try {
        if (socketRef.current) {
          socketRef.current.emit('leaveOrder', orderId);
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      } catch (e) {}
    }
  }, [orderId]);

  const getStepState = (stepKey) => {
    if (!order) return 'pending';
    const idxOrder = STEP_ORDER.findIndex(s => s.key === String(order.status));
    const idxStep = STEP_ORDER.findIndex(s => s.key === stepKey);
    if (idxStep < 0) return 'pending';
    if (idxStep < idxOrder) return 'done';
    if (idxStep === idxOrder) return 'active';
    return 'pending';
  };

  const formatTime = (t) => t ? new Date(t).toLocaleString() : '-';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <ProductsTitle text1={'TRACK'} text2={'ORDER'} />
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600">Back</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {order && (
        <div className="space-y-6">
          <div className="bg-white border rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Order</div>
                <div className="font-semibold">#{String(order._id).slice(-8)}</div>
                <div className="text-xs text-gray-400">{formatTime(order.date || order.createdAt)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">Status</div>
                <div className="font-medium">{order.status}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded p-5">
            <div className="relative">
              <div className="absolute left-6 right-6 top-6 border-t border-gray-200"></div>
              <div className="flex justify-between relative z-10">
                {STEP_ORDER.map(step => {
                  const state = getStepState(step.key);
                  return (
                    <div key={step.key} className="flex flex-col items-center w-1/5 text-center px-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2
                        ${state === 'done' ? 'bg-green-500 text-white' : state === 'active' ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {state === 'done' ? '✓' : step.label.split(' ')[0].charAt(0)}
                      </div>
                      <div className="text-xs font-medium">{step.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{state === 'done' || state === 'active' ? formatTime(order.updatedAt || order.date) : ''}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border rounded p-4">
              <div className="text-sm text-gray-500">Seller</div>
              <div className="font-medium">{(order.sellerName || (order.seller && (order.seller.name || order.seller.username))) || 'Seller'}</div>
              <div className="text-xs text-gray-500 mt-2">{order.sellerContact || ''}</div>
            </div>

            <div className="bg-white border rounded p-4">
              <div className="text-sm text-gray-500">Courier</div>
              <div className="font-medium">{order.tracking?.courier || order.courier || '—'}</div>
              <div className="text-xs text-gray-500 mt-2">{order.tracking?.service || ''}</div>
            </div>

            <div className="bg-white border rounded p-4">
              <div className="text-sm text-gray-500">Driver</div>
              <div className="font-medium">{order.tracking?.driver?.name || order.tracking?.driver?.id || '—'}</div>
              <div className="text-xs text-gray-500 mt-2">ETA: {order.tracking?.eta || '—'}</div>
            </div>
          </div>

          <div className="bg-white border rounded p-4">
            <div className="text-sm text-gray-500 mb-3">Driver location</div>
            {order.tracking?.location && order.tracking.location.lat && (
              <div className="h-64 bg-gray-50 border rounded flex items-center justify-center">
                <div className="text-sm">
                  <div>Lat: {order.tracking.location.lat}</div>
                  <div>Lng: {order.tracking.location.lng}</div>
                  <div className="text-xs text-gray-500 mt-2">Map integration (Google/Mapbox) can be added here.</div>
                </div>
              </div>
            )}
            {!order.tracking?.location && <div className="h-32 flex items-center justify-center text-gray-400">No live location available</div>}
          </div>

          <div className="bg-white border rounded p-4">
            <div className="text-sm text-gray-500 mb-2">Items</div>
            <div className="space-y-3">
              {(order.items || []).map((it, i) => {
                const prod = it.productSnapshot || it.product || {};
                const img = Array.isArray(prod?.image) ? prod.image[0] : (typeof prod?.image === 'string' ? prod.image : null);
                return (
                  <div key={i} className="flex items-center gap-4">
                    {img ? <img src={img} className="w-16 h-16 object-cover rounded" alt={prod?.name} /> : <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">No image</div>}
                    <div className="flex-1">
                      <div className="font-medium">{prod?.name || it.name || 'Product'}</div>
                      <div className="text-sm text-gray-500">Qty: {it.quantity}</div>
                    </div>
                    <div className="font-semibold">{order.currency || '$'}{it.price || prod?.price || '-'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;