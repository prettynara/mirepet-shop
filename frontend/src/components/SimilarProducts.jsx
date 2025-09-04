import React, { useContext, useEffect, useState }from 'react'
import { ShopContext } from '../context/ShopContext'
import ProductItem from './ProductItem'
import Title from './Title'

const SimilarProducts = ({category,subCategory}) => {
  
    const { products } =useContext(ShopContext)
    const [similar,setSimilar] = useState([]);

    useEffect(()=>{
        if (products.length > 0) {
            
            let productsCopy = products.slice();

            productsCopy = productsCopy.filter((item) => category === item.category);
            productsCopy = productsCopy.filter((item) => subCategory === item.subCategory);
            //console.log(productsCopy.slice(0,5));
            setSimilar(productsCopy.slice(0,5));
        }
    },[products])

    return (
    <div className='my-24'>
      <div className='text-center text-3x; py-2'>
        <Title text1={'SIMILAR'} text2={'PRODUCTS'} />
      </div>

      <div className='grid gri-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 gap-y-6'>
        {similar.map((item,index)=>(
            <ProductItem key={index}  id={item._id} name={item.name} image={item.image} option={item.options[0]} showDiscount={false} seller={item.seller} />
        ))}
      </div>
    </div>
  )
}

export default SimilarProducts
