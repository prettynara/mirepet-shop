import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import ProductsTitle from '../components/ProductsTitle';

const Orders = () => {

  const { products, currency } = useContext(ShopContext);

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <ProductsTitle text1={'MY'} text2={'ORDERS'} />
      </div>

      <div>
        {
          products.slice(1,4).map((item,index)=>{
          
          const option = item.options?.[0];

          // 가격 계산
          let priceDisplay;
          if (option?.special_price && option.sale_price < option.price) {
            priceDisplay = (
              <>
                <p className="text-gray-400 line-through">
                  {currency}{option.price}
                </p>
                <p className="text-red-600 font-semibold">
                  {currency}{option.sale_price}
                </p>
              </>
            );
          } else {
            priceDisplay = (
              <p className="font-semibold">
                {currency}{option?.price}
              </p>
            );
          }

          return(
            <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div className='flex items-start gap-6 text-sm'>
                  <img className='w-16 sm:w-20' src={item.image[0]} alt="" />
                    <div>
                      <p className='sm:text-base font-medium'>{item.name}</p>
                      
                       {/* 가격 + 옵션 정보 */}
                      <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                        {priceDisplay}
                        <p>Qauntity: 1</p>
                        <p>Weight: M</p>
                      </div>
                      <p className='mt-2'>Date: <span className='text-gray-400'>25, Sep, 2025</span></p>
                    </div>
                </div>
            </div>
          )
        })}
      </div>
      
    </div>
  )
}

export default Orders
