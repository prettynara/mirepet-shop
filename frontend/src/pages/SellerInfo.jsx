import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SellerInfo = () => {
  const [shopInfo, setShopInfo] = useState({
    shopName: '',
    location: '',
    phone: '+216', // 기본값으로 국가번호 넣기
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const validatePhone = (phone) => {
    // +216으로 시작하고 그 뒤에 숫자 8자리만 허용
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
    // 👉 백엔드 저장 로직 들어갈 부분

    // 저장 후 MyProducts 페이지로 이동
    navigate('/myproducts');
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-md m-auto mt-20 gap-5 text-gray-800 bg-white p-8 rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-4">Seller's Petshop Info</h2>
      <input
        type="text"
        placeholder="Shop Name"
        value={shopInfo.shopName}
        onChange={(e) => setShopInfo({ ...shopInfo, shopName: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <input
        type="text"
        placeholder="Shop Location"
        value={shopInfo.location}
        onChange={(e) => setShopInfo({ ...shopInfo, location: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <input
        type="text"
        placeholder="Phone Number (e.g. +21612345678)"
        value={shopInfo.phone}
        onChange={(e) => setShopInfo({ ...shopInfo, phone: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />

      {/* 에러 메시지 표시 */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="bg-blue-500 text-white px-6 py-2 rounded-lg mt-4 hover:bg-blue-600 transition"
      >
        Save & Continue
      </button>
    </form>
  );
};

export default SellerInfo;
