import React, {useContext , useEffect, useState } from 'react'
import { ShopContext} from './../context/ShopContext';
import { assets } from '../assets/assets';
import { useLocation } from 'react-router-dom';


const SearchBar = () => {

    const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
    const [visible,setVisible] = useState(false)
    const location = useLocation();

    useEffect(()=>{
        if (location.pathname.includes('products') && showSearch){
            setVisible(true);
        } else {
            setVisible(false);
        }
    },[location])

  return showSearch && visible ? (
    <div className='border-t border-b bg-white/80 backdrop-blur-md shadow-sm'>
      <div className='flex items-center justify-center py-6 relative max-w-3xl mx-auto w-[90%]'>
        <div className="flex items-center gap-3 border border-gray-300 bg-gray-50 px-4 py-3 rounded-2xl shadow-md flex-1">
        <input value={search} onChange={(e)=>setSearch(e.target.value)} className='flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400 text-sm' type="text" placeholder='Search for products, brands and more...' />
        <img className='w-5 opacity-70' src={assets.search_icon} alt="" />
      </div>
      <img onClick={()=>setShowSearch(false)} className='w-4 cursor-pointer opacity-70 hover:opacity-100 transition ml-3' src={assets.cross_icon} alt="" />
     </div>
    </div>
  ) : null
}

export default SearchBar
