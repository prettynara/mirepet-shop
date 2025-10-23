import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SellerInfo = () => {
  const [shopInfo, setShopInfo] = useState({
    shopName: '',
    location: '',
    phone: '+216',
    images: [],
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validatePhone = (phone) => {
    const regex = /^\+216\d{8}$/;
    return regex.test(phone);
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();

    if (!validatePhone(shopInfo.phone)) {
      setError('전화번호는 "+216"으로 시작하고 8자리 숫자를 포함해야 합니다.');
      return;
    }

    console.log('셀러 추가정보:', shopInfo);
    navigate('/myproducts');
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
