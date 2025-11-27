import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductsTitle from '../components/ProductsTitle';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'pending', label: 'Pending' },
  { value: 'ready', label: 'Ready' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [courierForms, setCourierForms] = useState({});
  const [savingIds, setSavingIds] = useState(new Set());
  const navigate = useNavigate();

  const fetchOrders = async (preserveForms = false) => {
    if (!preserveForms) setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/orders/all`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        withCredentials: true,
      });

      const ordersList = res.data?.orders || [];
      setOrders(ordersList);

      if (!preserveForms) {
        const forms = {};
        ordersList.forEach(o => {
          forms[String(o._id)] = {
            courier: o.tracking?.courier || '',
            trackingNumber: o.tracking?.trackingNumber || '',
            driverName: o.tracking?.driver?.name || '',
            driverPhone: o.tracking?.driver?.phone || '',
          };
        });
        setCourierForms(forms);
      } else {
        setCourierForms(prev => {
          const updated = { ...prev };
          ordersList.forEach(o => {
            const id = String(o._id);
            const existing = prev[id] || {};
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

      console.log('✅ Fetched', ordersList.length, 'orders');
    } catch (e) {
      console.error('❌ Failed to load orders', e?.response?.data || e.message);
      if (!preserveForms) setOrders([]);
    } finally {
      if (!preserveForms) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(false);

    const interval = setInterval(() => fetchOrders(true), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o => {
        const orderId = String(o._id).toLowerCase();
        const clientName = (o.deliveryInfo?.firstName + ' ' + o.deliveryInfo?.lastName).toLowerCase();
        const sellerName = (o.seller?.petshopName || o.seller?.name || '').toLowerCase();
        return orderId.includes(term) || clientName.includes(term) || sellerName.includes(term);
      });
    }

    setFilteredOrders(filtered);
  }, [orders, statusFilter, searchTerm]);

  const handleCourierInput = (orderId, field, value) => {
    setCourierForms(prev => ({ ...prev, [orderId]: { ...(prev[orderId] || {}), [field]: value } }));
  };

  const handleAssignCourier = async (orderId) => {
    const form = courierForms[orderId] || {};

    if (!form.courier && !form.trackingNumber && !form.driverName && !form.driverPhone) {
      alert('Please enter at least one field');
      return;
    }

    setSavingIds(s => new Set([...s, orderId]));
    try {
      const token = localStorage.getItem('token');
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
        }
      );

      if (res.data?.success) {
        await fetchOrders(true);
        alert('Courier info saved successfully');
      }
    } catch (err) {
      console.error('❌ Failed to assign courier:', err);
      alert(`Failed to save: ${err?.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setSavingIds(s => {
        const ns = new Set(s);
        ns.delete(orderId);
        return ns;
      });
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_BASE}/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          withCredentials: true,
        }
      );

      await fetchOrders(true);
    } catch (err) {
      console.error('❌ Failed to update order status', err?.response?.data || err.message);
      alert('Failed to update status.');
    }
  };

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

  if (loading) return <p className="mt-8 text-center">Loading orders...</p>;

  return (
    <div className="p-6">
      <ProductsTitle text1={'ADMIN'} text2={'ORDERS'} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6 mb-4">
        <input
          type="text"
          placeholder="Search by Order ID, Client, or Seller..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded px-4 py-2 text-sm"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4 mt-4">
        {filteredOrders.map(order => {
          const id = String(order._id);
          const firstItem = order.items?.[0]?.product || order.items?.[0]?.productSnapshot || null;
          const img = firstItem?.image ? (Array.isArray(firstItem.image) ? firstItem.image[0] : firstItem.image) : null;
          const form = courierForms[id] || {};
          const saving = savingIds.has(id);

          return (
            <div key={id} className="flex flex-col bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition">
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 border">
                      {img ? <img src={img} alt="" className="w-20 h-20 object-cover rounded" /> : '🧾'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Order</div>
                    <div className="font-semibold">#{id.slice(-8)}</div>
                    <div className="text-xs text-gray-400">{new Date(order.date || order.createdAt).toLocaleString()}</div>
                    <div className="text-sm mt-1">
                      <span className="text-gray-600">Items:</span> <span className="font-medium">{(order.items || []).reduce((s, it) => s + (it.quantity || 1), 0)}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Amount:</span> <span className="font-semibold">{order.currency || 'TND'}{order.amount}</span>
                    </div>
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full text-sm font-semibold self-start ${getStatusClass(order.status)}`}>
                  {order.status}
                </div>
              </div>

              {/* Client & Seller Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-b py-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Client</div>
                  <div className="font-medium">{order.deliveryInfo?.firstName || ''} {order.deliveryInfo?.lastName || ''}</div>
                  <div className="text-sm text-gray-600">{order.deliveryInfo?.email || '—'}</div>
                  <div className="text-sm text-gray-600">{order.deliveryInfo?.phone || '—'}</div>
                  <div className="text-xs text-gray-500 mt-1">{order.deliveryInfo?.street || ''}, {order.deliveryInfo?.city || ''}</div>
                </div>

                <div>
                  <div className="text-xs text-gray-500 mb-1">Seller</div>
                  <div className="font-medium">{order.seller?.petshopName || order.seller?.name || '—'}</div>
                  <div className="text-sm text-gray-600">{order.seller?.email || '—'}</div>
                  <div className="text-sm text-gray-600">{order.seller?.phone || '—'}</div>
                </div>
              </div>

              {/* Courier & Driver Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <input
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Courier company"
                    value={form.courier || ''}
                    onChange={(e) => handleCourierInput(id, 'courier', e.target.value)}
                  />
                  <input
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Tracking #"
                    value={form.trackingNumber || ''}
                    onChange={(e) => handleCourierInput(id, 'trackingNumber', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Driver name"
                    value={form.driverName || ''}
                    onChange={(e) => handleCourierInput(id, 'driverName', e.target.value)}
                  />
                  <input
                    className="border rounded px-3 py-2 text-sm"
                    placeholder="Driver phone"
                    value={form.driverPhone || ''}
                    onChange={(e) => handleCourierInput(id, 'driverPhone', e.target.value)}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <select
                  value={order.status || 'new'}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="border px-3 py-2 rounded text-sm"
                >
                  {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>

                <div className="flex gap-2">
                  <button
                    disabled={saving}
                    onClick={() => handleAssignCourier(id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm shadow-sm hover:opacity-95 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Courier Info'}
                  </button>
                  <button
                    onClick={() => {
                        if(!order._id) {
                            alert('Cannot tract this order: missing order ID');
                            return;
                        }
                        navigate(`/track/${order._id}`, {state: {orderId:order._id}});
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded text-sm shadow-sm hover:opacity-95"
                  >
                    Track
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <p className="text-center text-gray-500 mt-12">No orders found 📦</p>
      )}
    </div>
  );
};

export default AdminOrders;