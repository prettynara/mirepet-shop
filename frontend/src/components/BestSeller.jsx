import React, {useContext, useEffect, useState} from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {

  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    const bestProduct = products.filter((item)=>(item.bestseller));
    setBestSeller(bestProduct.slice(0,5))
  },[products]);

  return (
    <div className='my-10'>
        <div className='text-center text-3xl py-8'>
            <Title text1={'BEST'} text2={'SELLER'} />
            <p className='fredoka-regular w-3/4 m-auto text-xs sm:text-sm md:text-base text-blue-600'>
              Top selling products that customers love. Shop our best sellers now!
            </p>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6 mt-6'>
          {
            bestSeller.map((item,index)=> {
              const option = item.options?.[0]; // 첫 번째 옵션을 기본으로
              return (
                <ProductItem key={index} id={item._id} name={item.name} image={item.image} option={option} showDiscount={false} seller={item.seller} />
              );
            })
          }
        </div>
    </div>
  )
}

export default BestSeller
