// ...existing code...
import React, {useContext, useEffect, useState} from 'react'
import { ShopContext } from './../context/ShopContext';
import { assets } from '../assets/assets';
import ProductsTitle from '../components/ProductsTitle';
import ProductItem from '../components/ProductItem';
import axios from 'axios'; 
import { useRole } from '../context/RoleContext'; 

const Products = () => {

  const { products, search, showSearch, fetchProducts } = useContext(ShopContext);
  const { role } = useRole();
  const userRole = role || "guest";

  const [ showFilter, setShowFilter ] = useState(true);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');

  const toggleCategory = (e) => {
    const v = e.target.value;
    setCategory(prev => prev.includes(v) ? prev.filter(item => item !== v) : [...prev, v]);
  }

  const toggleSubCategory = (e) => {
    const v = e.target.value;
    setSubCategory(prev => prev.includes(v) ? prev.filter(item => item !== v) : [...prev, v]);
  }

  const getProductPrice = (p) => {
    if (!p) return 0;
    if (p.price) return Number(p.price);
    if (Array.isArray(p.options) && p.options[0] && p.options[0].price) return Number(p.options[0].price);
    return 0;
  }

  // apply filter + sort in one place to avoid update loop
  const applyFilterAndSort = () => {
    const productsList = Array.isArray(products) ? products : [];
    let list = productsList.slice();

    if (showSearch && search) {
      const q = search.toLowerCase();
      list = list.filter(item => (item.name || '').toLowerCase().includes(q));
    }

    if (category.length > 0) {
      list = list.filter(item => category.includes(item.category));
    }
    if (subCategory.length > 0) {
      list = list.filter(item => subCategory.includes(item.subCategory));
    }

    // Admin 제외 일반 유저는 isOnHold 상품 숨김
    if(userRole !== "admin") list = list.filter(p => !p.isOnHold);

    // 정렬 적용 (정렬은 필터링한 결과에 대해 한 번만 수행)
    switch (sortType) {
      case 'low-high':
        list.sort((a,b) => (getProductPrice(a) - getProductPrice(b)));
        break;
      case 'high-low':
        list.sort((a,b) => (getProductPrice(b) - getProductPrice(a)));
        break;
      case 'sale':
        list = list.filter(item => item.special_price === true);
        break;
      default:
        // relevant 기본(서버 정렬 유지)
        break;
    }

    setFilterProducts(list);
  }

  useEffect(()=>{
    applyFilterAndSort();
  },[category,subCategory,search, showSearch, products, userRole, sortType])

  //Admin Actions
  const handleHold = async (e, productId) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        : { withCredentials: true };

      const res = await axios.patch(`${base}/api/product/${productId}/hold`, {}, config);

      if (res.data?.success) {
        console.log('Product hold toggled:', res.data);

        //제품 목록 다시 불러오기
        if (typeof fetchProducts === 'function') {
          await fetchProducts();
        }
        alert(res.data.message);
      }
    } catch (err) {
      console.error(' hold error', err.response?.data || err.message);
      alert('Failed to toggle hold status');
    }
  }

  const handleDelete = async (e, productId) => {
    e.stopPropagtion();
    e.preventDefault();

    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        : { withCredentials: true };
        
      await axios.delete(`http://localhost:4000/api/product/${productId}`, config);

      // 제품 목록 다시 불러오기
      if (typeof fetchProducts === 'function') {
        await fetchProducts();
      }
      alert('Product deleted successfully');
    } catch (err) {
      console.error('delete error', err.response?.data || err.message);
      alert('Failed to delete product');
    }
  }

  return (
    <div className='flex flex-col sm:flex-row gap-6 sm:gap-10 pt-20 border-t'>
      
      {/* Filter Options */}
      <div className='min-w-60'>
        <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2 text-blue-600 font-semibold'>FILTERS
          <img className={`h-3 sm:hidden transition-transform duration-300 ${showFilter ? 'rotate-90' : '-rotate-90'}`} src={assets.back_icon} alt="" />
        </p>
        
        {/* Category Filter */}
        <div className={`border border-blue-200 bg-blue-50/40 rounded-lg pl-5 py-3 mt-6 shadow-sm ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-semibold text-blue-700'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-medium text-gray-700'>
            <label className='flex gap-2 cursor-pointer hover:text-blue-600'>
              <input className='w-3 accent-blue-600' type="checkbox" value={'Food'} onChange={toggleCategory}/> Food
            </label>
            <label className='flex gap-2 cursor-pointer hover:text-blue-600'>
              <input className='w-3 accent-blue-600' type="checkbox" value={'Treat'} onChange={toggleCategory}/> Treat
            </label>
            <label className='flex gap-2 cursor-pointer hover:text-blue-600'>
              <input className='w-3 accent-blue-600' type="checkbox" value={'Toy'} onChange={toggleCategory}/> Toy
            </label>
          </div>  
        </div>

        {/* Subcategory Filter*/}
        <div className={`border border-blue-200 bg-blue-50/40 rounded-lg pl-5 py-3 my-5 shadow-sm ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-semibold text-blue-700'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-medium text-gray-700'>
            <label className='flex gap-2 cursor-pointer hover:text-blue-600'>
              <input className='w-3 accent-blue-600' type="checkbox" value={'Dog'} onChange={toggleSubCategory}/> Dog
            </label>
            <label className='flex gap-2 cursor-pointer hover:text-blue-600'>
              <input className='w-3 accent-blue-600' type="checkbox" value={'Cat'} onChange={toggleSubCategory}/> Cat
            </label>
            <label className='flex gap-2 cursor-pointer hover:text-blue-600'>
              <input className='w-3 accent-blue-600' type="checkbox" value={'Bird'} onChange={toggleSubCategory}/> Bird
            </label>
          </div>  
        </div>
      </div>    
      
      {/* Right Side */}
      <div className='flex-1'>

        <div className='flex justify-between items-center mb-6'>
          <ProductsTitle text1={'All'} text2={'PRODUCTS'} />

          {/* Sale Products */}
          <select value={sortType} onChange={(e)=>setSortType(e.target.value)} className='border border-blue-300 bg-white text-sm px-3 py-2 rounded-md shadow-sm hover:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'>
            <option value="relevant">Sort by: Relevant</option>
            <option value="sale">Sort by: Sale Products</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>
          </select>
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {
            filterProducts.map((item)=>(
              <div key={item._id} className="relative">

              {userRole === "admin" && (
                <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
                  <button 
                    onClick={(e)=>handleHold(e, item._id)} 
                    className={`px-2 py-1 text-xs rounded shadow ${
                      item.isOnHold
                        ? "bg-gray-500 text-white hover:bg-gray-600"
                        : "bg-yellow-400 text-white hover:bg-yellow-500"
                    }`}
                  >
                    {item.isOnHold ? "Unhold" : "Hold"}
                  </button>
                  {/*
                  <button 
                    onClick={(e)=>handleDelete(e, item._id)} 
                    className="bg-red-500 text-white px-2 py-1 text-xs rounded shadow hover:bg-red-600"
                  >
                    Delete
                  </button> */}
                </div>
              )}

                <ProductItem
                  name={item.name}
                  id={item._id}
                  image={item.image}
                  seller={item.seller}
                  sellerName={item.sellerName}
                  sellerLogo={item.sellerLogo}
                  option={item.options?.[0]}
                />
             
              </div>
            ))}
        </div>

      </div>

    </div>
  )
}

export default Products
// ...existing code...