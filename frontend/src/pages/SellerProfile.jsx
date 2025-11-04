import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const SellerProfile = ({ sellerId: propSellerId }) => {
  const [sellerId, setSellerId] = useState(propSellerId || null);
  const [sellerData, setSellerData] = useState({
    name: "",
    owner: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    logo: "",
    petshopName: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

// get sellerId from localStorage or /api/me if not provided
  useEffect(() => {
    const init = async () => {
      try {
        if (propSellerId) {
          setSellerId(propSellerId);
          return;
        }
        const stored = JSON.parse(localStorage.getItem("user") || "null");
        if (stored && stored._id) {
          setSellerId(stored._id);
          return;
        }
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }
        const meRes = await fetch(`${API_BASE}/api/me`, {
          method: "GET",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (meRes.ok) {
          const d = await meRes.json();
          if (d?.user?._id) {
            setSellerId(d.user._id);
            localStorage.setItem("user", JSON.stringify(d.user));
          }
        }
      } catch (err) {
        console.debug("init sellerId failed", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [propSellerId]);

  // fetch seller details once we have sellerId
  useEffect(() => {
    if (!sellerId) return;
    const fetchSeller = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/api/sellers/${sellerId}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          withCredentials: true,
        });
        if (res.data) {
          // adapt shape if backend returns { seller } or direct object
          const payload = res.data.seller || res.data;
          setSellerData((prev) => ({ ...prev, ...payload }));
        }
      } catch (error) {
        console.error("Failed to fetch seller data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeller();
  }, [sellerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSellerData({ ...sellerData, [name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!sellerId) {
      alert("Seller ID is missing.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_BASE}/api/sellers/${sellerId}`,
        sellerData,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          withCredentials: true,
        }
      );
      setIsEditing(false);
      alert("Seller profile updated successfully!");
      // update local cache
      if (res.data?.seller) localStorage.setItem("user", JSON.stringify(res.data.seller));
    } catch (error) {
      console.error("Failed to save seller data:", error);
      alert("Failed to save changes. Please try again.");
    }
  };

  if (loading) return <p className="text-center mt-16">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex justify-center items-start py-16">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-10 border border-blue-100">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          🐾 Seller Profile
        </h1>

        {/* 로고 영역 */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            {sellerData.logo ? (
              <img
                src={sellerData.logo}
                alt="Logo"
                className="w-32 h-32 object-contain rounded-full border-4 border-blue-200 bg-white p-2 shadow-sm group-hover:scale-105 transition-all duration-300"
              />
            ) : (
              <div className="w-28 h-28 flex items-center justify-center rounded-full bg-gray-100 border-2 border-gray-300 text-gray-400">
                No Logo
              </div>
            )}
            {isEditing && (
              <input
                type="file"
                accept="image/*"
                className="mt-4 text-sm text-gray-600"
                onChange={(e) =>
                  setSellerData({
                    ...sellerData,
                    logo: URL.createObjectURL(e.target.files[0]),
                  })
                }
              />
            )}
          </div>
        </div>

        {/* 폼 */}
        <form className="space-y-5" onSubmit={handleSave}>
          {[
            { label: "Shop Name", name: "petshopName" },
            { label: "Owner Name", name: "owner" },
            { label: "Phone", name: "phone" },
            { label: "Address", name: "address" },
            { label: "Email", name: "email" },
          ].map((field, i) => (
            <div key={i}>
              <label className="text-gray-700 font-medium">{field.label}</label>
              <input
                type={field.name === "email" ? "email" : "text"}
                name={field.name}
                value={sellerData[field.name] || ""}
                //email must never be editable
                disabled={field.name === "email" ? true : !isEditing}
                onChange={handleChange}
                className={`w-full mt-1 px-4 py-2 rounded-lg border shadow-sm transition-all duration-200 ${
                  isEditing
                    ? "border-blue-400 focus:ring-2 focus:ring-blue-500 bg-white"
                    : "bg-gray-100 border-gray-200 cursor-not-allowed"
                }`}
              />
            </div>
          ))}

          <div>
            <label className="text-gray-700 font-medium">Description</label>
            <textarea name="description" value={sellerData.description || ""} disabled={!isEditing} onChange={handleChange} rows="3" className={`w-full mt-1 px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 ${isEditing ? "border-blue-400 focus:ring-2 focus:ring-blue-500 bg-white" : "bg-gray-100 border-gray-200 cursor-not-allowed"}`} />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            {isEditing ? (
              <>
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 rounded-lg text-gray-600 bg-gray-200 hover:bg-gray-300 transition">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm">Save Changes</button>
              </>
            ) : (
              <button type="button" onClick={() => setIsEditing(true)} className="px-6 py-2 rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-sm">Edit Profile</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerProfile;