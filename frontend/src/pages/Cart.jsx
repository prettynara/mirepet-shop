import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductsTitle from '../components/ProductsTitle';
import { assets } from '../assets/assets'; 

const Cart = () => {
  const { products, currency, cartItems, addToCart, setCartItems } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    const tempData = [];
    for (const productId in cartItems) {
      for (const optionKey in cartItems[productId]) {
        const quantity = cartItems[productId][optionKey];
        if (quantity > 0) {
          const product = products.find(p => p._id === productId);
          if (!product) continue;

          const option = product.options?.find(
            o => o.weight === optionKey || o.quantity === optionKey
          ) || null;

          tempData.push({
            ...product,
            option,
            quantity
          });
        }
      }
    }
    setCartData(tempData);
  }, [cartItems, products]);

  return (
    <div className='border-t pt-14'>
      <div className=' text-2xl mb-3'>
        <ProductsTitle text1={'YOUR'} text2={'CART'} />
      </div>

      <div>
        {
          cartData.map((item,index)=>{

              const productData = products.find((product)=>product._id === item._id);

              return (
                <div key={index} className='py-4 border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'>
                  <div className='flex items-start gap-6'>
                    <img className='w-16 sm:w-20' src={productData.image[0]} alt="" />
                      <div>
                        <p className='text-xm sm:text-lg font-medium'>{productData.name}</p>
                        <div className='flex items-center gap-5 mt-2'>
                          {item.option?.special_price && item.option.sale_price < item.option.price ? (
                            <>
                              <p className='text-gray-400 line-through'>{currency}{item.option.price}</p>
                              <p className='text-red-600 font-semibold'>{currency}{item.option.sale_price}</p>
                            </>
                          ) : (
                            <p className='font-semibold'>{currency}{item.option?.price}</p>
                          )}
                          <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.option?.weight || item.option?.quantity}</p>
                        </div>
                      </div>
                  </div>
                  <input className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1' type="number" min={1} defaultValue={item.quantity} />
                </div>
              )
          })
        }
      </div>

    </div>
  )
}

export default Cart;
