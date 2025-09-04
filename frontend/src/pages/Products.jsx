import React, {useContext, useEffect, useState} from 'react'
import { ShopContext } from './../context/ShopContext';
import { assets } from '../assets/assets';
import ProductsTitle from '../components/ProductsTitle';
import ProductItem from '../components/ProductItem';

const Products = () => {

  const { products, search, showSearch } = useContext(ShopContext);
  const [ showFilter, setShowFilter ] = useState(true);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)){
      setCategory(prev=> prev.filter(item => item !== e.target.value))
    }
    else {
      setCategory(prev => [...prev, e.target.value])
    }
  }

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)){
      setSubCategory(prev=> prev.filter(item => item !== e.target.value))
  }
    else {
      setSubCategory(prev => [...prev, e.target.value])
    }
  }

  const applyFilter = () => {
    let productsCopy = products.slice();

    if(showSearch && search) {
      productsCopy = productsCopy.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category));
    }
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory));
    }

    setFilterProducts(productsCopy);
  }

/*  useEffect(()=>{
    setFilterProducts(products)
  },[]) */ // no more need this fonction because we hhave applyFilter 

  const sortProduct = () =>{
    let fpCopy = filterProducts.slice();
    switch (sortType) {
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=> (a.price - b.price)));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=> (b.price - a.price)));
        break;
      case 'sale':
        setFilterProducts(fpCopy.filter(item => item.special_price === true));
        break;
      default:
        applyFilter();
        break;
    }
  }

  useEffect(()=>{
    applyFilter();
  },[category,subCategory,search, showSearch])


  useEffect(()=>{
    sortProduct();
  },[sortType])


  return (
    <div className='flex flex-col sm:flex-row gap-6 sm:gap-10 pt-12 border-t'>
      
      {/* Filter Options */}
      <div className='min-w-60'>
        <p onClick={() => setShowFilter(!showFilter)} className='my-2 text-xl flex items-center cursor-pointer gap-2 text-blue-600 font-semibold'>FILTERS

          {/* mobile */}
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
          <select onChange={(e)=>setSortType(e.target.value)} className='border border-blue-300 bg-white text-sm px-3 py-2 rounded-md shadow-sm hover:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none'>
            <option value="relevant">Sort by: Relevant</option>
            <option value="sale">Sort by: Sale Products</option>
            <option value="low-high">Sort by: Low to High</option>
            <option value="high-low">Sort by: High to Low</option>

          </select>
        </div>

        {/* Map Products */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {
            filterProducts.map((item,index)=>(
              <ProductItem key={index} name={item.name} id={item._id} image={item.image} seller={item.seller} option={item.options[0]} />
            ))
          }
        </div>

      </div>

    </div>
  )
}

export default Products
