import React, { useContext, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext'
import ProductsTitle from '../components/ProductsTitle';
import { assets } from '../assets/assets';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Orders = () => {

  const { products, currency } = useContext(ShopContext);
  const [orders, setOrders] = useState([]);
  const [productMap, setProductMap] = useState({});
  const pollRef = useRef(null);

  // ensure hooks order stable: call useNavigate at top-level
  const navigate = useNavigate();

   // new: fetch client orders from server
  const fetchClientOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE}/api/orders/client`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        withCredentials: true
      });
      console.debug('[Orders] GET /api/orders/client status=', res.status, 'data=', res.data);
      const serverOrders = Array.isArray(res.data?.orders) ? res.data.orders : [];
      // debug: show returned orders and their id-like fields (safe optional chaining)
      console.debug(
        '[Orders] fetched serverOrders count=',
        serverOrders.length,
        'sample=',
        serverOrders.slice(0, 5).map(o => ({
          _id: o._id,
          id: o.id,
          maybe_id: o._id?.$oid || o._id?._id || o._doc?._id || null
        }))
      );
      // build productMap from products context OR response items
      const map = {};
      (products || []).forEach(p => { if (p && (p._id || p.id)) map[String(p._id || p.id)] = p; });
      // also include any product objects returned inside order.items
      serverOrders.forEach(o => (o.items || []).forEach(it => {
        const p = it.product || it.productSnapshot;
        if (p && (p._id || p.id)) map[String(p._id || p.id)] = p;
      }));
      setProductMap(map);
      setOrders(serverOrders);
      // persist fallback locally if desired
      try { localStorage.setItem('orders', JSON.stringify(serverOrders)); } catch(e) {}
    } catch (err) {
      console.debug('Failed to fetch client orders, falling back to localStorage', err?.response?.data || err?.message);
      // fallback to localStorage (existing behavior)
      try {
        const stored = JSON.parse(localStorage.getItem('orders') || '[]');
        setOrders(stored);
      } catch (e) {
        setOrders([]);
      }
    }
  };

  useEffect(() => {
    fetchClientOrders();
    // poll every 10s to pick up status changes by seller
    pollRef.current = setInterval(fetchClientOrders, 10000);
    return () => clearInterval(pollRef.current);
  }, [products]);


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

  // resolve image source safely from product or item snapshot
  const resolveImageSrc = (prod, item) => {
    const candidate = prod || item?.product || item;
    if (!candidate) return null;
    const imgField = candidate.image ?? candidate.images ?? candidate.imageUrl ?? candidate.img ?? null;
    if (Array.isArray(imgField) && imgField.length) return imgField[0];
    if (typeof imgField === 'string' && imgField.trim()) return imgField.trim();
    return assets?.placeholder || null;
  };

  // enrich orders by attaching product snapshot when missing (tries products context first, then backend)
  const enrichOrdersWithProducts = async (rawOrders) => {
    if (!Array.isArray(rawOrders) || rawOrders.length === 0) return rawOrders;
    const updated = JSON.parse(JSON.stringify(rawOrders)); // shallow clone
    const fetchCache = {}; // avoid duplicate fetches per product id

    await Promise.all(updated.map(async (order) => {
      const items = Array.isArray(order.items) ? order.items : convertOrderItems(order.items);
      order.items = items;
      await Promise.all(items.map(async (it) => {
        const pid = String(it._id || it.product?._id || '');
        if (!pid) return;
        // find in current products context
        const found = (products || []).find(p => String(p._id) === pid);
        if (found) {
          it._product = found;
          return;
        }
        // if already fetched in this run, reuse
        if (fetchCache[pid]) {
          it._product = fetchCache[pid];
          return;
        }
        // try backend single product endpoint
         try {
          // Prefer to fetch the product list once (server exposes /api/product/list as used elsewhere)
          if (!fetchCache.__list__) {
            try {
              const listRes = await axios.get(`${API_BASE}/api/product/list`);
              const list = Array.isArray(listRes.data?.products) ? listRes.data.products : (Array.isArray(listRes.data) ? listRes.data : []);
              fetchCache.__list__ = list;
            } catch (err) {
              fetchCache.__list__ = null; // mark as attempted
            }
          }
          const list = fetchCache.__list__ || [];
          const candidate = list.find(p => String(p._id) === pid || String(p.id) === pid) || null;
          if (candidate) {
            fetchCache[pid] = candidate;
            it._product = candidate;
            return;
          }
        } catch (e) {
          console.debug('[Orders] product list fetch error for', pid, e?.message || e);
        }
        // mark missing to avoid repeated attempts in same run
        fetchCache[pid] = null;
        // no product found — leave as-is
      }));
    }));

    return updated;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = JSON.parse(localStorage.getItem('orders')) || [];
        // if global products list is empty, fetch product list from backend and build map
        if ((!products || products.length === 0) && stored.length > 0) {
          try {
            const res = await axios.get(`${API_BASE}/api/product/list`);
            const list = Array.isArray(res.data?.products) ? res.data.products : (Array.isArray(res.data) ? res.data : []);
            const map = {};
            list.forEach(p => { if (p && (p._id || p.id)) map[String(p._id || p.id)] = p; });
            if (mounted) setProductMap(map);
          } catch (err) {
            console.debug('[Orders] failed to fetch product list', err?.response?.status || err?.message);
          }
        } else {
          // build map from products context
          const map = {};
          (products || []).forEach(p => { if (p && (p._id || p.id)) map[String(p._id || p.id)] = p; });
          if (mounted) setProductMap(map);
        }
        const enriched = await enrichOrdersWithProducts(stored);
        if (mounted) setOrders(enriched);
      } catch (e) {
        console.warn('Failed to load orders', e);
        if (mounted) setOrders([]);
      }
    })();
    return () => { mounted = false; };
  }, []); // load once on mount

  // when products list becomes available later, re-enrich to pick images from context
  useEffect(() => {
    if (!orders || !orders.length || !products || !products.length) return;
    let mounted = true;
    (async () => {
      try {
        const enriched = await enrichOrdersWithProducts(orders);
        if (mounted) setOrders(enriched);
      } catch (e) {
        console.debug('re-enrich orders failed', e);
      }
    })();
    return () => { mounted = false; };
  }, [products]);

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

  // status -> badge classes mapping
  const statusClasses = {
    new: { bg: 'bg-blue-100', text: 'text-blue-800' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    ready: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    'out-for-delivery': { bg: 'bg-orange-100', text: 'text-orange-800' },
    'out-for-delivery_alt': { bg: 'bg-orange-100', text: 'text-orange-800' },
    delivered: { bg: 'bg-green-100', text: 'text-green-800' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800' },
    default: { bg: 'bg-gray-100', text: 'text-gray-700' },
  };

    const renderStatusBadge = (status) => {
    const key = (status || '').toString().toLowerCase();
    const cls = statusClasses[key] || statusClasses.default;
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${cls.bg} ${cls.text}`}>
        {status || 'unknown'}
      </span>
    );
  };


  return (
    <div className='border-t pt-14 px-4 sm:px-8 lg:px-20 min-h-[80vh]'>

      {/* Title */}
      <div className='text-2xl mb-8'>
        <ProductsTitle text1={'MY'} text2={'ORDERS'} />
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-6">
        {orders.map((order, idx) => (
          <div key={order._id || order.id || idx} className='flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all'>
            <div className='flex items-start gap-4 text-sm sm:text-base'>
              <div>
                <p className='font-medium text-base sm:text-lg'>Order #{order._id ? String(order._id).slice(-6) : (order.id || idx)}</p>
                <p className='mt-1 text-sm text-gray-500'>Date: <span className='text-gray-400'>{new Date(order.date || order.createdAt || Date.now()).toLocaleString()}</span></p>
                <p className='mt-2 text-sm text-gray-600'>Status: {renderStatusBadge(order.status)}</p>
              </div>
            </div>

            <div className='flex-1'>
              <div className='grid grid-cols-1 gap-3'>
                {(Array.isArray(order.items) ? order.items : convertOrderItems(order.items)).map((it, i) => {
                  const prodRef = it.productSnapshot || it._product || productMap[String(it._id)] || ((products || []).find(p => String(p._id) === String(it._id)) || it.product)|| it;
                  const option = (prodRef?.options || []).find(o =>
                    String(o.weight ?? o.quantity) === String(it.option?.weight ?? it.option?.quantity)
                  ) || it.option || {};

                  const imgSrc = resolveImageSrc(prodRef, it);

                  return (
                    <div key={i} className='flex items-center justify-between border rounded p-3 bg-slate-50'>
                      <div className='flex items-center gap-4'>
                        {imgSrc ? (
                          <img src={imgSrc} alt={prodRef.name || 'product'} className='w-16 h-16 object-cover rounded' />
                        ) : (
                          <div className='w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-gray-400'>No image</div>
                        )}
                        <div>
                          <p className='font-medium'>{prodRef.name || prodRef.title || it.name || 'Product'}</p>
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
              <button
                onClick={() => {
                  // try several common id shapes returned by different mongoose/lean/populate combos
                  const candidates = [
                    order._id,
                    order.id,
                    order._id?.$oid,
                    order._id?._id,
                    order._doc?._id,
                    order._doc?._id?.$oid
                  ];
                  // pick first candidate that's a string/number
                  const oid = candidates.find(v => v !== undefined && v !== null && (typeof v === 'string' || typeof v === 'number'));
                  console.debug('navigate: idCandidates=', candidates, 'selected=', oid, 'order=', order);
                  if (!oid) {
                    alert('Cannot track this order: missing order id. Check Network GET /api/orders/client response in DevTools.');
                    return;
                  }
                  navigate(`/track/${String(oid)}`, { state: { orderId: String(oid) } });
                }}
                className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg'
              >
                Track Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;