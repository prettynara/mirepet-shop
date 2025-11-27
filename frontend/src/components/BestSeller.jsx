import React, { useEffect, useState } from 'react'
import Title from './Title';
import ProductItem from './ProductItem';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const BestSeller = () => {
  const [bestSeller, setBestSeller] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching bestsellers from /api/product/bestsellers...');
        
        const res = await axios.get(`${API_BASE}/api/product/bestsellers`, {
          withCredentials: true
        });

        console.log('✅ Bestsellers response:', res.data);

        if (res.data?.success && Array.isArray(res.data.bestsellers)) {
          setBestSeller(res.data.bestsellers.slice(0, 5)); // Top 5만 표시
          console.log('📊 Loaded', res.data.bestsellers.length, 'bestsellers');
        } else {
          setBestSeller([]);
          console.log('⚠️ No bestsellers found');
        }
      } catch (err) {
        console.error('❌ Failed to fetch bestsellers:', err);
        setBestSeller([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  if (loading) {
    return (
      <div className='my-10'>
        <div className='text-center text-3xl py-8'>
          <Title text1={'BEST'} text2={'SELLER'} />
        </div>
        <p className='text-center text-gray-500'>Loading bestsellers...</p>
      </div>
    );
  }

  if (!bestSeller || bestSeller.length === 0) {
    return (
      <div className='my-10'>
        <div className='text-center text-3xl py-8'>
          <Title text1={'BEST'} text2={'SELLER'} />
        </div>
        <p className='text-center text-gray-500'>No bestsellers yet 🏆</p>
      </div>
    );
  }

  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1={'BEST'} text2={'SELLER'} />
        <p className='fredoka-regular w-3/4 m-auto text-xs sm:text-sm md:text-base text-blue-600'>
          Top selling products based on delivered orders. Shop our best sellers now!
        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6 mt-6'>
        {bestSeller.map((item, index) => {
          const option = item.options?.[0]; // 첫 번째 옵션을 기본으로
          return (
            <div key={item._id || index} className="relative">
              <ProductItem 
                id={item._id} 
                name={item.name} 
                image={item.image} 
                option={option} 
                showDiscount={false} 
                seller={item.seller}
                sellerName={item.sellerName}
                sellerLogo={item.sellerLogo}
              />
              {/* 판매량 배지 */}
              <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow z-10">
                🏆 #{index + 1}
              </div>
              {item.totalSold && (
                <div className="absolute bottom-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-lg">
                  {item.totalSold} sold
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}

export default BestSeller