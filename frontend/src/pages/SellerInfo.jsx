import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const SellerInfo = () => {
  const [shopInfo, setShopInfo] = useState({
    shopName: '',
    location: '',
    phone: '+216',
    images: [],
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);  
  const navigate = useNavigate();

  const validatePhone = (phone) => {
    const regex = /^\+216\d{8}$/;
    return regex.test(phone);
  };

  const fileToBase64 = (file) =>
    new Promise((res, rej) => {
      if (!file) return res(null);
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.onerror = (e) => rej(e);
      reader.readAsDataURL(file);
    });  

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!validatePhone(shopInfo.phone)) {
      setError('Number should start with +216 and have 8 digits.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // determine current user id and token
      let userId = null;
      try {
        const stored = JSON.parse(localStorage.getItem('user') || 'null');
        if (stored && stored._id) userId = stored._id;
      } catch (err) { /* ignore */ }

      // fallback to /api/me if no user in localStorage
      if (!userId) {
        const token = localStorage.getItem('token');
        if (token) {
          const meRes = await fetch(`${API_BASE}/api/me`, {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            credentials: 'include'
          });
          if (meRes.ok) {
            const meData = await meRes.json();
            const u = meData?.user || meData;
            if (u?._id) {
              userId = u._id;
              localStorage.setItem('user', JSON.stringify(u));
            }
          } else {
            throw new Error('Not authenticated');
          }
        }
      }

      if (!userId) {
        setError('login is required to perform this action.');
        setSaving(false);
        navigate('/login');
        return;
      }

      const token = localStorage.getItem('token');

      // prepare payload: map fields to backend schema
      const payload = {
        petshopName: shopInfo.shopName || '',
        address: shopInfo.location || '',
        phone: shopInfo.phone || '',
      };

      // include first image as data URL (simple approach)
      if (shopInfo.images && shopInfo.images.length > 0) {
        const base64 = await fileToBase64(shopInfo.images[0]);
        if (base64) payload.logo = base64;
      }

      const res = await fetch(`${API_BASE}/api/sellers/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        console.error('Save failed:', res.status, err);
        setError(err?.message || 'failed to save in ther sever.');
        setSaving(false);
        return;
      }

      const data = await res.json().catch(() => null);
      // update local cache if server returned updated user
      if (data?.seller) {
        try { localStorage.setItem('user', JSON.stringify(data.seller)); } catch (e) { /* ignore */ }
      }

      // success -> navigate to seller profile or myproducts
      navigate('/seller-profile');
    } catch (err) {
      console.error('SellerInfo submit error:', err);
      setError(err.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setShopInfo((prev) => ({ ...prev, images: files }));
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-2xl m-auto mt-16 gap-8 text-gray-800 bg-gradient-to-br from-blue-50 to-indigo-100 p-10 rounded-3xl shadow-xl"
    >
      <h2 className="text-3xl font-bold text-indigo-700 mb-2">🏪 Seller's Petshop Information</h2>
      <p className="text-gray-500 text-center mb-6">
        Please provide your shop details below. <br />
        Upload up to 3 images for your store logo or photos.
      </p>

      <div className="w-full bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition">
        <div className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Shop Name"
            value={shopInfo.shopName}
            onChange={(e) => setShopInfo({ ...shopInfo, shopName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
          />

          <input
            type="text"
            placeholder="Shop Location"
            value={shopInfo.location}
            onChange={(e) => setShopInfo({ ...shopInfo, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
          />

          <input
            type="text"
            placeholder="Phone Number (e.g. +21612345678)"
            value={shopInfo.phone}
            onChange={(e) => setShopInfo({ ...shopInfo, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
          />

          {/* 이미지 업로드 */}
          <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50 transition">
            <span className="text-gray-500 font-medium">
              📸 Upload Logo / Photos (max 3)
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* 이미지 미리보기 */}
          {shopInfo.images.length > 0 && (
            <div className="flex gap-3 mt-3 flex-wrap">
              {shopInfo.images.map((file, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-24 h-24 object-cover rounded-xl border border-gray-200 shadow-sm"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 에러 메시지 */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>

      <button
        type="submit"
        className="bg-indigo-600 text-white px-8 py-3 rounded-xl shadow-md hover:bg-indigo-700 active:scale-95 transition-transform"
      >
        💾 Save & Continue
      </button>
    </form>
  );
};

export default SellerInfo;
