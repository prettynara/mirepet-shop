import React, { useContext, useEffect, useState }from 'react'
import { ShopContext } from '../context/ShopContext'
import ProductItem from './ProductItem'
import Title from './Title'

const SimilarProducts = ({category,subCategory, selectedOption}) => {
  
    const { products } =useContext(ShopContext)
    const [similar,setSimilar] = useState([]);

    useEffect(()=>{
        if (products.length > 0 && selectedOption) {
            let productsCopy = products.slice();

            // 카테고리와 서브카테고리 기준 필터링
            productsCopy = productsCopy.filter((item) => category === item.category && subCategory === item.subCategory);
            //console.log(productsCopy.slice(0,5));

            // weight가 있으면 weight로 비교, 없으면 quantity로 비교
            if (selectedOption.weight) {
              productsCopy = productsCopy.filter((item) =>
                item.options.some((opt) => opt.weight === selectedOption.weight)
            )
            } else if (selectedOption.quantity) {
              productsCopy = productsCopy.filter((item) =>
                item.options.some((opt) => opt.quantity === selectedOption.quantity)
              )
            }

            // 첫 번째 일치하는 옵션을 같이 넘겨줌
            const mapped = productsCopy.map((item) => {
              const matchedOption =
                item.options.find(
                  (opt) =>
                    (selectedOption.weight && opt.weight === selectedOption.weight) ||
                    (selectedOption.quantity && opt.quantity === selectedOption.quantity)
                ) || item.options[0]

              return { ...item, matchedOption }
            })
        
            setSimilar(mapped.slice(0,5));
        }
    },[products, category, subCategory, selectedOption])

    return (
    <div className='my-24'>
      <div className='text-center text-3x; py-2'>
        <Title text1={'SIMILAR'} text2={'PRODUCTS'} />
      </div>

      <div className='grid gri-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 gap-y-6'>
        {similar.map((item,index)=>(
            <ProductItem key={index}  id={item._id} name={item.name} image={item.image} option={item.matchedOption} showDiscount={false} seller={item.seller} />
        ))}
      </div>
    </div>
  )
}

export default SimilarProducts
