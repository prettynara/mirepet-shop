import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { sellers, products as allProducts } from "../assets/assets";
import axios from "axios";
import ProductItem from "../components/ProductItem";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const SellerDetail = () => {
  const { sellerId } = useParams();
  const [seller, setSeller] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [error, setError] = useState(null);

useEffect(() => {
    if (!sellerId) return;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1) try to fetch single seller (may be protected)
        try {
          const res = await axios.get(`${API_BASE}/api/sellers/${sellerId}`);
          const payload = res.data?.seller || res.data;
          if (payload) setSeller(payload);
          // 좋아요 수 초기화( DB에 저장된 값이 있으면 사용)
          setLikes(payload.likes ?? payload.likeCount ?? 0);
        } catch (err) {
          // fallback: fetch public sellers list and find by id
          try {
            const list = await axios.get(`${API_BASE}/api/sellers`);
            const found = (list.data?.sellers || []).find((s) => String(s._id) === String(sellerId));
            if (found) setSeller(found);
            setLikes(found.likes ?? found.likeCount ?? 0);
          } catch (e) {
            // ignore - we'll still try to get products
            console.debug("fallback get sellers failed", e?.message || e);
          }
        }

        // 2) fetch products and filter by seller id
        try {
          const pres = await axios.get(`${API_BASE}/api/product/list`);
          const all = Array.isArray(pres.data.products) ? pres.data.products : [];
          const filtered = all.filter((p) => {
            // product.seller may be populated object or id string
            if (!p) return false;
            if (typeof p.seller === "object" && p.seller._id) return String(p.seller._id) === String(sellerId);
            return String(p.seller) === String(sellerId);
          });
          setSellerProducts(filtered);
        } catch (e) {
          console.error("Failed to load products:", e);
        }
      } catch (err) {
        console.error("SellerDetail fetch error:", err);
        setError("Failed to load seller details.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [sellerId]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (!seller && sellerProducts.length === 0)
    return <div className="text-center mt-20">Seller not found</div>;
 
  return (
    <div className="pt-12 min-h-screen bg-blue-50/30 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="relative bg-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row gap-6 items-start">
        <div className="flex-shrink-0 flex justify-center items-center">
          {seller?.logo ? (
            <img
              src={seller.logo}
              alt={seller.petshopName || seller.name}
              className="w-28 h-28 object-contain rounded-full border-4 border-white shadow-md bg-white"
            />
          ) : (
            <div className="w-28 h-28 flex justify-center items-center bg-gray-100 text-gray-400 rounded-full border border-gray-300">
              No Logo
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-800">
            {seller?.petshopName || seller?.name || "Seller"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Owner: {seller?.owner || "N/A"}</p>
          <p className="text-sm text-gray-600">{seller?.phone || "-"}</p>
          <p className="text-xs text-gray-500 mt-1">{seller?.address || "No address"}</p>
          {seller?.description && <p className="mt-3 text-gray-600">{seller.description}</p>}
        </div>

        <div className="absolute top-3 right-3 z-30">
          <div className="flex items-center gap-2 bg-white border rounded-full px-3 py-1 shadow-md">
            <span className="text-red-500 text-lg select-none">❤️</span>
            <span className="font-semibold text-sm">{likes ?? seller?.likes ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Seller's products */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Products from {seller?.petshopName || seller?.name || "this seller"}</h2>

        {sellerProducts.length === 0 ? (
          <p className="text-gray-500">No products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {sellerProducts.map((p) => (
              <div key={p._id} className="relative">
                <ProductItem
                  id={p._id}
                  image={p.image}
                  name={p.name}
                  seller={p.seller}
                  sellerName={p.sellerName || seller?.petshopName}
                  sellerLogo={p.sellerLogo || seller?.logo}
                  option={p.options?.[0]}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 mt-6">{error}</p>}
    </div>
  );
};

export default SellerDetail;
