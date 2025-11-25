import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProductsTitle from "../components/ProductsTitle";
import { sellers as initialSellers} from '../assets/assets';
import { useRole } from '../context/RoleContext';
import axios from 'axios';
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Sellers = ({ userRole }) => {
  const [allSellers, setAllSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState(initialSellers);
  //likes map: { sellerId: count }
  const [likesMap, setLikesMap] = useState({});
  // liked state per client (persisted in localStorage)
  const [likedMap, setLikedMap] = useState(() => {
    try {return JSON.parse(localStorage.getItem('likedSellers') || '{}') ;} catch {return {};}
  });

  const { role: ctxRole } = useRole();
  const effectiveRole = userRole || ctxRole || "guest";
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("name");
  const navigate = useNavigate();

    useEffect(() => {
    fetchSellers();
    // eslint-disable-next-line
  }, []);

  const fetchSellers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token 
        ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        : { withCredentials: true };

      console.log( 'Fetching seller from /api/sellers...');
      const res = await axios.get(`${API_BASE}/api/sellers`, config);

      console.log('Sellers response:', res.data);

      const sellers = res.data?.sellers || [];

      setAllSellers(sellers);
      setFilteredSellers(sellers);

      // initialize likes map from server data
      const lm = {};
      sellers.forEach(s => { lm[s._id] = Number(s.likes ?? s.likeCount ?? 0); });
      setLikesMap(lm);

      console.log('Fetched sellers:', sellers.length);
    } catch (err) {
      console.error("Failed to fetch sellers:", err);

      console.log('Using fallback sellers(empty array)');
      setAllSellers([]);
      setFilteredSellers([]);
    }
  };

  // Hold toggle api 호출
  const toggleHold = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();

    try {
    const token = localStorage.getItem('token');
    const res = await axios.patch(
      `${API_BASE}/api/users/seller/${id}/hold`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );
    if (res.data?.success) {
      console.log('Hold toggled:', res.data);

      // 서버 응답으로 로컬 state 업데이트
      setAllSellers(prev => prev.map(s =>
        s._id === id ? { ...s, isOnHold: res.data.seller.isOnHold} : s
      ))

      filterAndSetSellers(search, sortType, prev => prev.map(s => 
        s._id === id ? {...s, isOnHold: res.data.seller.isOnHold} : s
      ));

      alert(res.data.message);
    }
  } catch (err) {
    console.error('toggleHold error:', err);
    alert('Failed to toggle hold status');
  }
}

  // toggle like for a seller (optimistic, persisted in localStorage)
  const toggleLike = async (e, id) => {
    e.stopPropagation();
    e.preventDefault();

    const token = localStorage.getItem('token');

    if (token) {
      try {
        const res = await axios.post(
          `${API_BASE}/api/sellers/${id}/like`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        if (res.data?.success) {
          const { liked, likes } = res.data;
          setLikedMap(prev => ({ ...prev, [id]: !!liked }));
          setLikesMap(prev => ({ ...prev, [id]: Number(likes || 0) }));
          try {
            const local = JSON.parse(localStorage.getItem('likedSellers') || '{}');
            local[id] = !!liked;
            localStorage.setItem('likedSellers', JSON.stringify(local));
          } catch {}
        }
      } catch (err) {
        console.debug('like API failed', err?.response?.data || err.message);
      }
      return;
    }

    // unauthenticated fallback (local-only)
    const currentlyLiked = !!likedMap[id];
    const newLiked = !currentlyLiked;
    setLikedMap(prev => {
      const next = { ...prev, [id]: newLiked };
      try { localStorage.setItem('likedSellers', JSON.stringify(next)); } catch {}
      return next;
    });
    setLikesMap(prev => {
      const cur = Number(prev[id] || 0);
      const nextCount = cur + (newLiked ? 1 : -1);
      return { ...prev, [id]: Math.max(0, nextCount) };
    });
    alert('Login to save likes across devices.');
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    filterAndSetSellers(value, sortType);
  };

  const handleSort = (type) => {
    setSortType(type);
    filterAndSetSellers(search, type);
  };

  {/* const toggleLike = (id, e) => {
    e.stopPropagation(); // 카드 클릭 이벤트 방지
    setLikedSellers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }; */}

  // admin function
  {/* const handleEdit = (e, id) => {
    e.stopPropagation();
    navigate(`/seller-profile/${id}`, { state: { startEditing: true } });
  } */} // admin edit function is not needed now

  const handleDelete = (e, id) => {
    e.stopPropagation();
    e.preventDefault();

    if (window.confirm("Are you sure you want to delete this seller?")) {
      // 나중에 backend 연결시 axios.delete(`/api/sellers/${id}`) 등으로 변경
      setFilteredSellers((prev) => prev.filter((s) => s._id !== id));
   }
 };

 const handleClientClick = (id) => {
  console.log('navigate to seller-details:', `/seller-detail/${id}`);
  navigate(`/seller-detail/${id}`, {replace: false});
 };

 // 검색+정렬+보류 필터
  const filterAndSetSellers = (searchValue, sort, updateFn) => {
    const source = updateFn ? updateFn(allSellers) : allSellers;

    let filtered = source.filter((s) =>
      ( s.name || s.petshopName || '' ).toLowerCase().includes(searchValue)
    );

    if (sort === "name") {
      filtered.sort((a, b) => (a.petshopName || a.name || '').localeCompare(b.petshopName || b.name || ''));
    }
      if (sort === "recent") {
      filtered.sort((a, b) => new Date(b.createAt) - new Date(a.createAt))
    }
    // Client/Guest는 보류 숨기기
    if (effectiveRole !== "admin") {
      filtered = filtered.filter((s) => !s.isOnHold);
    }

    setFilteredSellers(filtered);
  };

  useEffect(() => {
    filterAndSetSellers(search, sortType);
  }, [allSellers, effectiveRole]);

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
          <div key={seller._id} className="relative">
          {effectiveRole === "admin" && (
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <button
                  onClick={(e) => toggleHold(e, seller._id)}
                  className={`px-2 py-1 text-xs rounded-md shadow ${
                    seller.isOnHold
                      ? "bg-gray-400 text-white"
                      : "bg-yellow-400 text-white hover:bg-yellow-500"
                  }`}
                >
                  {seller.isOnHold ? "On Hold" : "Hold"}
                </button>
                <button
                  onClick={(e) => handleDelete(e, seller._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded-md shadow"
                >
                  Delete
                </button>
              </div>
            )}

          <Link
            key={seller._id}
            to={`/seller-detail/${seller._id}`}
            className="relative block cursor-pointer bg-white border border-blue-100 shadow-md rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden"
          >
            {/* like / heart button - top-left */}
            <button
              onClick={(e) => toggleLike(e, seller._id)}
              className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-white/90 px-2 py-1 rounded-full shadow-sm text-sm"
              aria-label={likedMap[seller._id] ? 'Unlike seller' : 'Like seller'}
            >
              <span className={likedMap[seller._id] ? "text-red-500" : "text-gray-400"} style={{fontSize: 16}}>
                {likedMap[seller._id] ? '❤️' : '🤍'}
              </span>
              <span className="text-xs font-medium">{likesMap[seller._id] ?? 0}</span>
            </button>            

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

                {/* Hold 상태 표시 (admin 전용) */}
                {effectiveRole === "admin" && seller.isOnHold && (
                  <div className="mt-2 inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                    On Hold
                  </div>
                )}
              </div>
            </Link>
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
