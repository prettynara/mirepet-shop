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
          products.slice(1,4).map((item,index)=>(
            <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div className='flex items-start gap-6 text-sm'>
                  <img className='w-16 sm:w-20' src={item.image[0]} alt="" />

                </div>
            </div>
          ))
        }
      </div>
      
    </div>
  )
}

export default Orders
