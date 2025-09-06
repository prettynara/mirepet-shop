import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductsTitle from '../components/ProductsTitle';
import { assets } from '../assets/assets'; 
import CartTotal from './../components/CartTotal';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity } = useContext(ShopContext);
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
    <div className='border-t pt-14 px-4 sm:px-8 lg:px-20'>
      {/* Title */}
      <div className='text-2xl mb-6'>
        <ProductsTitle text1={'YOUR'} text2={'CART'} />
      </div>

      {/* Cart Items */}
      <div className="flex flex-col gap-6">
        {cartData.map((item,index)=>{

              const productData = products.find((product)=>product._id === item._id);

              return (
                <div key={index} className='grid grid-cols-[4fr_1fr_0.5fr] items-center gap-6 bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all'>
                  
                  {/* Product Info */}
                  <div className='flex items-start gap-4'>
                    <img className='w-16 sm:w-20 rounded-md' src={productData.image[0]} alt="" />
                      <div>
                        <p className='text-base sm:text-lg font-medium'>{productData.name}</p>
                        <div className='flex items-center gap-4 mt-2'>
                          {item.option?.special_price && item.option.sale_price < item.option.price ? (
                            <>
                              <p className='text-gray-400 line-through'>{currency}{item.option.price}</p>
                              <p className='text-red-600 text-lg font-semibold'>{currency}{item.option.sale_price}</p>
                            </>
                          ) : (
                            <p className='font-semibold'>{currency}{item.option?.price}</p>
                          )}
                          <span className='px-2 py-1 text-base border rounded bg-slate-50'>{item.option?.weight || item.option?.quantity}</span>
                        </div>
                      </div>
                  </div>

                {/* Controls */}
                <div className="flex justify-center">
                  <input onChange={(e)=> e.target.value === '' || e.target.value === '0' ? null : updateQuantity(item._id, item.option?.weight || item.option?.quantity, Number(e.target.value))} className='border w-14 sm:w-20 px-2 py-1 rounded text-center' type="number" min={1} defaultValue={item.quantity} />

                <div className="flex justify-end pl-20">
                 <img onClick={()=>updateQuantity(item._id, item.option?.weight || item.option?.quantity,0)} className='w-6 sm:w-6 cursor-pointer hover:opacity-70' src={assets.bin_icon} alt=""/>
                </div>  
                </div>
              </div>
              )
          })
        }
      </div>

      {/* Cart Total */}
      <div className='flex justify-end my-16'>
        <div className='w-full sm:w-[450px] bg-gray-50 p-6 rounded-xl shadow'>
          <CartTotal />
          <div className='w-full text-end'>
            <button className='bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-xl shadow-md shadow-blue-200 hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-300 ease-in-out mt-6'>PROCEED TO CHECKOUT</button>
          
          </div>
        </div>

      </div>

    </div>
  )
}

export default Cart;
