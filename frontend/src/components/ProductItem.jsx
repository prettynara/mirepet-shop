import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';

const ProductItem = ({id, image, name, seller, option, showDiscount=true}) => {

    const {currency} = useContext(ShopContext);
    const price = option?.price;
const sale_price = option?.sale_price;
const special_price = option?.special_price;
const weight = option?.weight;

  return (
    <Link className='text-gray-700 cursor-pointer' to={`/product/${id}`}>
      <div className='overflow-hidden relative rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 bg-white'>
        <img className='w-full h-48 object-cover transition-transform duration-300 ease-in-out hover:scale-105' src={image[0]} alt=""/>
      
      {/*할인 뱃지(이미지 위에)*/}
      {showDiscount && price > sale_price && (
        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow">
        {Math.round(((price - sale_price) / price) * 100)}% OFF
       </span>
    )}
      </div>
      
      {/* 상품 정보 */}
      <div className="pt-3 px-2 flex flex-col gap-1">

      {/*상품명*/}
      <p className='text-sm font-medium line-clamp-2'>{name}</p>

      {/*가격*/}
      <div className='flex items-center gap-2'>
        {special_price && price > sale_price ? (
          <>
          <p className='text-sm text-gray-400 line-through'>{currency}{price}</p>
          <p className='text-sm font-bold text-red-600'>{currency}{sale_price}</p>
          </>
        ) : (
          <p className='text-sm font-bold'>{currency}{price}</p>
        )}
      </div>

      {/* 무게 */}
      <p className='text-sm text-gray-700'>{weight}</p>

      {/*판매자*/}
      <p className='text-sm text-gray-700'>{seller}</p>
    </div>
    </Link>
  )
}

export default ProductItem
