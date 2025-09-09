import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import ProductsTitle from '../components/ProductsTitle';

const Orders = () => {

  const { products, currency } = useContext(ShopContext);

  return (
    <div className='border-t pt-14 px-4 sm:px-8 lg:px-20 min-h-[80vh]'>
      
      {/* Title */}
      <div className='text-2xl mb-8'>
        <ProductsTitle text1={'MY'} text2={'ORDERS'} />
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-6">
        {products.slice(1,4).map((item,index)=>{
          const option = item.options?.[0];

          // 가격 계산
          let priceDisplay;
          if (option?.special_price && option.sale_price < option.price) {
            priceDisplay = (
              <>
                <p className="text-gray-400 line-through text-sm sm:text-base">
                  {currency}{option.price}
                </p>
                <p className="text-red-600 font-semibold text-sm sm:text-base">
                  {currency}{option.sale_price}
                </p>
              </>
            );
          } else {
            priceDisplay = (
              <p className="font-semibold text-sm sm:text-base">
                {currency}{option?.price}
              </p>
            );
          }

          return(
            <div key={index} className='flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all'>
                
                {/* Left: Product Info */}
                <div className='flex items-start gap-4 text-sm sm:text-base'>
                  <img className='w-16 sm:w-20 rounded-md' src={item.image[0]} alt="" />
                    <div>
                      <p className='font-medium text-base sm:text-lg'>{item.name}</p>
                      
                       {/* 가격 + 옵션 정보 */}
                      <div className='flex items-center gap-3 mt-2'>
                        {priceDisplay}
                        <span className="px-2 py-1 border rounded bg-slate-50 text-sm">
                        <p>Qauntity: 1</p>
                        </span>
                        <span className="px-2 py-1 border rounded bg-slate-50 text-sm">
                        <p>Weight: M</p>
                        </span>
                      </div>

                      {/* Date */}
                      <p className='mt-2 text-sm text-gray-500'>Date: <span className='text-gray-400'>25, Sep, 2025</span></p>
                    </div>
                </div>

                {/* Right: Status + Action */}
                <div className='flex flex-col sm:flex-row sm:items-center sm:justify-end gap-36 md:w-1/2'>
                <div className='flex items-center gap-2'>
                  <p className='min-w-2 h-2 rounded full bg-green-500'></p>
                  <p className='text-sm md:text-base text-gray-700'>Ready to deliver</p>

                </div>
                <button className='bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium px-6 py-2 rounded-lg shadow-sm hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-300 ease-in-out'>Track Order</button>

                </div>
            </div>
          )
        })}
      </div>
      
    </div>
  )
}

export default Orders
