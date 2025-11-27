import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ProductsTitle from '../components/ProductsTitle';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/orders/stats`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        withCredentials: true,
      });

      if (res.data?.success) {
        setStats(res.data.stats);
        console.log('✅ Stats loaded:', res.data.stats);
      }
    } catch (err) {
      console.error('❌ Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // 30초마다 자동 갱신
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <ProductsTitle text1={'ADMIN'} text2={'DASHBOARD'} />
        <p className="text-center mt-8">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <ProductsTitle text1={'ADMIN'} text2={'DASHBOARD'} />

      {/* 주요 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* 이번 주 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">📅 This Week</h3>
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">
              7 Days
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Orders</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.week?.orders || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-semibold text-blue-600">
                TND {(stats?.week?.revenue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* 이번 달 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">📊 This Month</h3>
            <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
              30 Days
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Orders</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.month?.orders || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-semibold text-green-600">
                TND {(stats?.month?.revenue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* 전체 누적 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">💰 All Time</h3>
            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-semibold">
              Total
            </span>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Orders</p>
              <p className="text-3xl font-bold text-gray-800">{stats?.total?.orders || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-semibold text-purple-600">
                TND {(stats?.total?.revenue || 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 상태별 주문 통계 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">📦 Orders by Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { key: 'new', label: 'New', color: 'bg-blue-100 text-blue-700', icon: '🆕' },
            { key: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
            { key: 'ready', label: 'Ready', color: 'bg-indigo-100 text-indigo-700', icon: '📦' },
            { key: 'out-for-delivery', label: 'Out for Delivery', color: 'bg-orange-100 text-orange-700', icon: '🚚' },
            { key: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-700', icon: '✅' },
            { key: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '❌' },
          ].map((status) => (
            <div
              key={status.key}
              className={`${status.color} rounded-xl p-4 text-center hover:scale-105 transition-transform cursor-pointer`}
              onClick={() => navigate(`/admin/orders?status=${status.key}`)}
            >
              <div className="text-3xl mb-2">{status.icon}</div>
              <p className="text-sm font-medium mb-1">{status.label}</p>
              <p className="text-2xl font-bold">{stats?.byStatus?.[status.key] || 0}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 빠른 액션 버튼 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <button
          onClick={() => navigate('/admin/orders')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <div className="text-4xl mb-2">📋</div>
          <h4 className="text-lg font-semibold mb-1">Manage Orders</h4>
          <p className="text-sm opacity-90">View and update all orders</p>
        </button>

        <button
          onClick={() => navigate('/products')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <div className="text-4xl mb-2">🛍️</div>
          <h4 className="text-lg font-semibold mb-1">Manage Products</h4>
          <p className="text-sm opacity-90">Hold or delete products</p>
        </button>

        <button
          onClick={() => navigate('/seller-list')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <div className="text-4xl mb-2">🏪</div>
          <h4 className="text-lg font-semibold mb-1">Manage Sellers</h4>
          <p className="text-sm opacity-90">Hold or delete sellers</p>
        </button>
      </div>

      {/* 최근 활동 요약 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
            <div className="text-3xl">📅</div>
            <div>
              <p className="text-sm text-gray-600">Average Orders per Week</p>
              <p className="text-xl font-bold text-blue-600">
                {stats?.total?.orders && stats?.week?.orders 
                  ? (stats.total.orders / Math.max(1, Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)))).toFixed(1)
                  : 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
            <div className="text-3xl">💵</div>
            <div>
              <p className="text-sm text-gray-600">Average Order Value</p>
              <p className="text-xl font-bold text-green-600">
                TND {stats?.total?.orders && stats?.total?.revenue 
                  ? (stats.total.revenue / stats.total.orders).toFixed(2)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;