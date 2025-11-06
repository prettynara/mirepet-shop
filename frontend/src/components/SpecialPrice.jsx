import React, {useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const SpecialPrice = () => {

    const { products } = useContext(ShopContext);
    //console.log(products);
    const [specialProducts, setSpecialProducts] = useState([]);
    
    useEffect(() =>{
      const specialProduct = products.filter(
        (item) => item.options?.some(opt => opt.special_price === true)
      );
      setSpecialProducts(specialProduct.slice(0,10));
    },[products]);

  return (
    <div className=' my-10'>
      <div className=' text-center py-8 text-3xl'>
      <Title text1={'SPECIAL'} text2={'PRICE'} />
      <p className='fredoka-regular w-3/4 m-auto text-xs sm:text-sm md:text-base text-blue-600'>
        Discover our exclusive special prices on selected items. Don't miss out on these limited-time offers!
      </p>
      </div>

      {/* Rendering Products */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6 mt-6'>
        {specialProducts.map((item, index) => {
          // special price가 있는 옵션 하나만 선택
           const option = item.options.find(opt => opt.special_price) || item.options[0];
           return (
            <ProductItem
              key={index}
              id={item._id}
              image={item.image}
              name={item.name}
              seller={item.seller}
              sellerName={item.sellerName || (typeof item.seller === 'object' ? item.seller.petshopName: '')}
              sellerLogo={item.sellerLogo || (typeof item.seller === 'object' ? item.seller.logo:'')}
              option={option}
            />
        );
      })}
      </div>

    </div>  
   
  )
}

export default SpecialPrice
