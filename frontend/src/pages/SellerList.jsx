import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductsTitle from "../components/ProductsTitle";
import { sellers } from '../assets/assets';

const Sellers = ({ userRole = "admin" }) => {
  const [filteredSellers, setFilteredSellers] = useState(sellers);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("name");
  const [likedSellers, setLikedSellers] = useState({}); // 하트 클릭 상태
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = sellers.filter((s) =>
      s.name.toLowerCase().includes(value)
    );
    setFilteredSellers(filtered);
  };

  const handleSort = (type) => {
    setSortType(type);
    let sorted = [...filteredSellers];
    if (type === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (type === "recent")
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredSellers(sorted);
  };

  const toggleLike = (id, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    setLikedSellers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // admin function
  {/* const handleEdit = (e, id) => {
    e.stopPropagation();
    navigate(`/seller-profile/${id}`, { state: { startEditing: true } });
  } */} // admin edit function is not needed now

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this seller?")) {
      // 나중에 backend 연결시 axios.delete(`/api/sellers/${id}`) 등으로 변경
      alert(`Seller ${id} deleted`);
      setFilteredSellers(filteredSellers.filter((s) => s._id !== id));
    }
  }

  return (
    <div className="pt-12 border-t min-h-screen bg-blue-50/30">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 px-6">
        <ProductsTitle text1="All" text2="SELLERS" />
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search sellers..."
            value={search}
            onChange={handleSearch}
            className="border border-blue-300 rounded-md px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-100 outline-none"
          />
          <select
            value={sortType}
            onChange={(e) => handleSort(e.target.value)}
            className="border border-blue-300 bg-white text-sm px-3 py-2 rounded-md shadow-sm hover:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          >
            <option value="name">Sort by: Name</option>
            <option value="recent">Sort by: Recent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 px-6">
        {filteredSellers.map((seller) => (
          <div
            key={seller._id}
            onClick={() => navigate(`/seller-detail/${seller._id}`)}
            className="relative cursor-pointer bg-white border border-blue-100 shadow-md rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
          >
            {/* Heart for only Client */}
            {userRole === "client" && (
            <button
              onClick={(e) => toggleLike(seller._id, e)}
              className="absolute top-3 right-3 z-10 text-xl transition-all duration-200"
            >
              {likedSellers[seller._id] ? "❤️" : "🤍"}
            </button>
            )}

            {/* Admin Edit/Delete Buttons */}
            {userRole === "admin" && (
               <div className="absolute top-3 right-3 flex gap-2 z-10">
                {/* <button
                  onClick={(e) => handleEdit(e, seller._id)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 text-xs rounded-md shadow"
                >
                  Edit
                </button>  admin edit function is not needed now */} 
                <button
                  onClick={(e) => handleDelete(e, seller._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded-md shadow"
                >
                  Delete
                </button>
              </div>
            )}

            <div className="relative w-full h-40 bg-blue-50 flex justify-center items-center">
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

            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold text-gray-800">
                {seller.name || "Unnamed Shop"}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                Owner: {seller.owner || "N/A"}
              </p>
              <p className="text-sm text-gray-600">{seller.phone || "-"}</p>
              <p className="text-xs text-gray-500 mt-2 truncate">
                {seller.address || "No address"}
              </p>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                {seller.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredSellers.length === 0 && (
        <p className="text-center text-gray-500 mt-12">
          No sellers found 🐾
        </p>
      )}
    </div>
  );
};

export default Sellers;
