import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductsTitle from '../components/ProductsTitle';
import { assets } from '../assets/assets';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'pending', label: 'Pending' },
  { value: 'ready', label: 'Ready' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courierForms, setCourierForms] = useState({});
  const [savingIds, setSavingIds] = useState(new Set());

  const fetchOrders = async (preserveForms = false) => {
    if (!preserveForms) setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/orders/mine`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        withCredentials: true,
      });
      setOrders(res.data?.orders || []);

      // preserveForms=true면 기존 입력값 유지
      if (!preserveForms) {
      const forms = {};
      (res.data?.orders || []).forEach(o => {
        forms[String(o._id)] = {
          courier: o.tracking?.courier || '',
          trackingNumber: o.tracking?.trackingNumber || '',
          driverName: o.tracking?.driver?.name || '',
          driverPhone: o.tracking?.driver?.phone || '',
        };
      });
      setCourierForms(forms);
    } else {
      // 서버 데이터로 업데이트하되, 사용자가 입력 중인 필드는 보존
      setCourierForms(prev => {
        const updated = { ...prev};
        (res.data?.orders || []).forEach(o => {
          const id = String(o._id);
          const existing = prev[id] || {};

          // 입력값이 없는 필드만 서버 데이터로 채움
          updated[id] = {
            courier: existing.courier || o.tracking?.courier || '',
            trackingNumber: existing.trackingNumber || o.tracking?.trackingNumber || '',
            driverName: existing.driverName || o.tracking?.driver?.name || '',
            driverPhone: existing.driverPhone || o.tracking?.driver?.phone || '',
          };
          });
          return updated;
        });
      }
    } catch (e) {
      console.error('Failed to load seller orders', e?.response?.data || e.message);
      if (!preserveForms) setOrders([]);
    } finally {
      if (!preserveForms) setLoading(false);
    }
  };

  useEffect(() => { 
    fetchOrders(false); 

    // 10초마다 자동 갱신(실시간 폴링)
    const interval = setInterval(() => fetchOrders(true), 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCourierInput = (orderId, field, value) => {
    setCourierForms(prev => ({ ...prev, [orderId]: { ...(prev[orderId] || {}), [field]: value } }));
  };

  const handleAssignCourier = async (orderId) => {
    const form = courierForms[orderId] || {};

    // 빈 값 제출 방지
    if (!form.courier && !form.trackingNumber && !form.driverName && !form.driverPhone) {
      alert('Please enter at least one field (courier, tracking, or driver info)');
      return;
    }

    setSavingIds(s => new Set([...s, orderId]));
    try {
      const token = localStorage.getItem('token');

    console.log('🔄 Sending courier info:', {
      orderId,
      courier: form.courier,
      trackingNumber: form.trackingNumber,
      driver: {
        name: form.driverName,
        phone: form.driverPhone
      }
    });

      const res = await axios.put(
        `${API_BASE}/api/orders/${orderId}/assign-courier`, 
        {
        courier: form.courier || '',
        trackingNumber: form.trackingNumber || '',
        driver: { 
          name: form.driverName || '', 
          phone: form.driverPhone || '' 
        },
      },    
      {
        headers: { 
          'Content-Type': 'application/json', 
          ...(token ? { Authorization: `Bearer ${token}` } : {}) 
        },
        withCredentials: true
      });

      console.log('Server response:', res.data);

      const updated = res.data?.order;
      if (!updated) {
        console.error('No order returned from server:', res.data);
        alert('Server did not return updated order. Please refresh and try again.');
        return;
      }

      // 주문 목록 업데이트
        setOrders(prev => prev.map(o => (String(o._id) === String(orderId) ? updated : o)));
       
        // 저장 후 해당 주문 폼만 서버 데이터로 업데이트
        setCourierForms(prev => ({
          ...prev,
          [orderId]: {
            courier: updated.tracking?.courier || '',
            trackingNumber: updated.tracking?.trackingNumber || '',
            driverName: updated.tracking?.driver?.name || '',
            driverPhone: updated.tracking?.driver?.phone || '',
          }
        }));
        
        console.log('Courier info saved:', updated.tracking);
        alert('Courier/driver info saved successfully');
    } catch (err) {
    console.error(' Failed to assign courier:', err);
    console.error(' Response data:', err?.response?.data);
    console.error(' Status:', err?.response?.status);
    
    alert(` Failed to save: ${err?.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setSavingIds(s => {
        const ns = new Set(s);
        ns.delete(orderId);
        return ns;
      });
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const prev = orders.map(o => ({ ...o }));
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE}/api/orders/${orderId}/status`, { status: newStatus }, {
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        withCredentials: true,
      });

      // replace the updated order in state with server-returned order (populated)
      const updated = res.data?.order;
      if (updated) {
        setOrders(prevOrders => prevOrders.map(o => (String(o._id) === String(orderId) ? updated : o)));
      
      // 상태 변경 후 주문 목록 갱신(폼 데이터 보존))
        fetchOrders(true);
      } else {
        // optimistic fallback
        setOrders(prevOrders => prevOrders.map(o => (String(o._id) === String(orderId) ? { ...o, status: newStatus } : o)));
      }
    } catch (err) {
      console.error('Failed to update order status', err?.response?.data || err.message);
      // revert on error
      setOrders(prev);
      alert('Failed to update status.');
    }
  };

  if (loading) return <p className="mt-8 text-center">Loading orders...</p>;
  if (!orders.length) return <p className="mt-8 text-center">No orders yet.</p>;

  return (
    <div className="p-6">
      <ProductsTitle text1={'MY'} text2={'ORDERS'} />
      <div className="space-y-4 mt-4">
        {orders.map(order => {
          const id = String(order._id);
          const firstItem = order.items?.[0]?.product || order.items?.[0]?.productSnapshot || null;
          const img = firstItem?.image ? (Array.isArray(firstItem.image) ? firstItem.image[0] : firstItem.image) : null;
          const form = courierForms[id] || {};
          const saving = savingIds.has(id);

          return (
            <div key={id} className="flex flex-col md:flex-row items-stretch gap-4 bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition">
              <div className="md:w-2/5 flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border">
                    {img ? <img src={img} alt="" className="w-20 h-20 object-cover rounded" /> : '🧾'}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Order</div>
                      <div className="font-semibold">#{id.slice(-8)}</div>
                      <div className="text-xs text-gray-400">{new Date(order.date || order.createdAt).toLocaleString()}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {order.status}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    <div>Items: <span className="font-medium">{(order.items || []).reduce((s, it) => s + (it.quantity || 1), 0)}</span></div>
                    <div className="mt-1">Amount: <span className="font-semibold">{order.currency || 'TND'}{order.amount}</span></div>
                  </div>
                </div>
              </div>

              {/* 중앙: buyer 정보만 노출(중복되는 배송/택배 섹션 제거) */}
              <div className="md:w-1/3 flex flex-col justify-center py-2 px-3 border-l border-r">
                <div className="text-xs text-gray-500">Buyer</div>
                <div className="font-medium">{order.deliveryInfo?.firstName || ''} {order.deliveryInfo?.lastName || ''}</div>
                <div className="text-sm text-gray-600 mt-1">{order.deliveryInfo?.street || ''}</div>
                <div className="text-sm text-gray-600">{order.deliveryInfo?.city || ''}{order.deliveryInfo?.zipcode ? ` • ${order.deliveryInfo.zipcode}` : ''}</div>
                <div className="text-xs text-gray-400 mt-2">Email: {order.deliveryInfo?.email || '—'}</div>
                <div className="text-xs text-gray-400">Phone: {order.deliveryInfo?.phone || '—'}</div>
              </div>

              <div className="md:w-2/5 flex flex-col justify-between gap-3">
                <div className="flex gap-2">
                  <input className="flex-1 border rounded px-3 py-2 text-sm" placeholder="Courier company" value={form.courier || ''} onChange={(e)=>handleCourierInput(id,'courier',e.target.value)} />
                  <input className="w-36 border rounded px-3 py-2 text-sm" placeholder="Tracking #" value={form.trackingNumber || ''} onChange={(e)=>handleCourierInput(id,'trackingNumber',e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <input className="flex-1 border rounded px-3 py-2 text-sm" placeholder="Driver name" value={form.driverName || ''} onChange={(e)=>handleCourierInput(id,'driverName',e.target.value)} />
                  <input className="w-36 border rounded px-3 py-2 text-sm" placeholder="Driver phone" value={form.driverPhone || ''} onChange={(e)=>handleCourierInput(id,'driverPhone',e.target.value)} />
                </div>
                <div className="flex items-center justify-between">
                  <select value={order.status || 'new'} onChange={(e) => handleStatusChange(order._id, e.target.value)} className="border px-3 py-2 rounded text-sm">
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button disabled={saving} onClick={()=>handleAssignCourier(id)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm shadow-sm hover:opacity-95">
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;