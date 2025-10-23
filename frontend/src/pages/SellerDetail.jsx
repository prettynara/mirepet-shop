import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { sellers, products as allProducts } from "../assets/assets";

const SellerDetail = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const foundSeller = sellers.find((s) => s._id === sellerId);
    if (foundSeller) {
      setSeller(foundSeller);
      // products에서 sellerId가 일치하는 것 필터
      const filteredProducts = allProducts.filter(
        (p) => p.sellerId === sellerId
      );
      setSellerProducts(filteredProducts);
      // 현재는 임의 값, 나중에 서버에서 가져올 수 있음
      setLikes(foundSeller.likes || 0);
    }
  }, [sellerId]);

  if (!seller) return <div className="text-center mt-20">Seller not found</div>;

  return (
    <div className="pt-12 min-h-screen bg-blue-50/30 px-4 sm:px-6 lg:px-8">
      {/* Header + Description 카드 통합 */}
      <div className="relative bg-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row gap-6">
        {/* 로고 */}
        <div className="flex-shrink-0 flex justify-center items-center">
          {seller.logo ? (
            <img
              src={seller.logo}
              alt={seller.name}
              className="w-28 h-28 object-contain rounded-full border-4 border-white shadow-md bg-white"
            />
          ) : (
            <div className="w-28 h-28 flex justify-center items-center bg-gray-100 text-gray-400 rounded-full border border-gray-300">
              No Logo
            </div>
          )}
        </div>

        {/* 기본 정보 + Description */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">{seller.name}</h1>
            <p className="text-sm text-gray-500 mt-1">Owner: {seller.owner || "N/A"}</p>
            <p className="text-sm text-gray-600">{seller.phone || "-"}</p>
            <p className="text-xs text-gray-500 mt-1">{seller.address || "No address"}</p>
            <p className="mt-3 text-gray-600">{seller.description}</p>
          </div>

          {/* 하트 총합 카드 */}
          <div className="absolute top-3 right-3 flex items-center gap-2 bg-gray-100 rounded-md px-3 py-1 shadow">
            <span className="text-red-500 text-xl">❤️</span>
            <span className="font-semibold">{likes}</span>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {sellerProducts.length > 0 ? (
          sellerProducts.map((product) => (
            <div key={product._id} className="bg-white p-4 rounded-xl shadow-md">
              <img src={product.image[0]} alt={product.name} className="w-full h-40 object-cover rounded-md mb-2"/>
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.description}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center mt-6">No products yet.</p>
        )}
      </div>
    </div>
  );
};

export default SellerDetail;
