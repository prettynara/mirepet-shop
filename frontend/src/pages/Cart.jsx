import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductsTitle from '../components/ProductsTitle';
import { assets } from '../assets/assets'; // cross_icon 가져오기

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

  const decreaseQty = (productId, optionKey) => {
    const updatedCart = { ...cartItems };
    if (updatedCart[productId][optionKey] > 1) {
      updatedCart[productId][optionKey] -= 1; //1개 줄이기
    } else {
      delete updatedCart[productId][optionKey]; //옵션 삭제
      if (Object.keys(updatedCart[productId]).length === 0) {
        delete updatedCart[productId]; // 제품 자체 삭제 
      }
    }
    setCartItems(updatedCart);
  };

  const removeItem = (productId, optionKey) => {
    const updatedCart = { ...cartItems };
    delete updatedCart[productId][optionKey];
    if (Object.keys(updatedCart[productId]).length === 0) {
      delete updatedCart[productId];
    }
    setCartItems(updatedCart);
  };


  {/* 총 수량/총 금액은 reduce로 계산 */}
  const totalQty = cartData.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartData.reduce((sum, item) => sum + (item.option?.sale_price || 0) * item.quantity, 0);

  return (
    <div className='border-t pt-14 max-w-4xl mx-auto'>
      <div className='text-2xl mb-6'>
        <ProductsTitle text1={'YOUR'} text2={'CART'} />
      </div>

      {cartData.length === 0 ? (
        <p className='text-center text-gray-500'>장바구니가 비어있습니다.</p>
      ) : (
        <div className='space-y-4'>
          {cartData.map((item, index) => {
            const itemTotal = (item.option?.sale_price || 0) * item.quantity;
            return (
              <div key={index} className='py-4 px-4 border rounded-lg flex justify-between items-center shadow-sm'>
                
                <div className='flex items-center gap-4'>
                  <img className='w-16 sm:w-20 rounded' src={item.image[0]} alt={item.name} />
                  <div>
                    <p className='font-semibold text-lg'>{item.name}</p>
                    <p className='text-gray-500'>{item.option?.weight || item.option?.quantity}</p>
                    <p className='text-blue-700 font-semibold text-lg'>
                      {item.option?.sale_price} {currency} {/* 단가 */}
                    </p>
                    <p className='text-gray-700 mt-1'>
                      합계: {itemTotal} {currency} ({item.quantity} × {item.option?.sale_price})
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => decreaseQty(item._id, item.option?.weight || item.option?.quantity)}
                    className='px-2 py-1 bg-gray-200 rounded hover:bg-gray-300'
                  >
                    -
                  </button>
                  <span className='px-2'>{item.quantity}</span> {/* 현재 수량 표시 */}
                  <button
                    onClick={() => addToCart(item._id, item.option)}
                    className='px-2 py-1 bg-gray-200 rounded hover:bg-gray-300'
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item._id, item.option?.weight || item.option?.quantity)}
                    className='ml-2 p-1 hover:bg-gray-200 rounded'
                  >
                    <img src={assets.cross_icon} alt="삭제" className='w-5 h-5' />
                  </button>
                </div>
              </div>
            );
          })}

          {/* 총액 */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg flex justify-between items-center shadow-inner">
            <span className="text-lg sm:text-xl font-semibold">총 수량: {totalQty}</span>
            <span className="text-lg sm:text-xl font-semibold text-blue-700">
              총 금액: {totalPrice} {currency}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
