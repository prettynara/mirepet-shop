import React, { useContext, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from './../assets/assets';

const Product = () => {
  const { productId } = useParams();
  const { products, currency } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  const fetchProductData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setProductData(item);
        setImage(item.image[0]);
        // 옵션이 있다면 첫 번째 옵션 선택
        if (item.options && item.options.length > 0) {
          setSelectedOption(item.options[0]);
        }
        return null;
      }
    })
  }

  useEffect(() => {
    fetchProductData();
  }, [productId, products])

  if (!productData) return <div className="opacity-0"></div>;

  return (
    <div className='border-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/* Product Data */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/* Product Images */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%]'>
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer'
                alt=""
              />
            ))}
          </div>
          <div className='w-full sm:w-[80%]'>
            <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* Product Info */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>

          {/* 별점 */}
          <div className='flex items-center gap-1 mt-2'>
            <img src={assets.star_icon} alt="" className="w-5 h-5" />
            <img src={assets.star_icon} alt="" className="w-5 h-5" />
            <img src={assets.star_icon} alt="" className="w-5 h-5" />
            <img src={assets.star_icon} alt="" className="w-5 h-5" />
            <img src={assets.star_dull_icon} alt="" className="w-5 h-5" />
            <p className='pl-2'>(122)</p>
          </div>

          {/* 가격 표시 (옵션 기반) */}
          {selectedOption && (
            <p className="mt-5 text-3xl font-medium">
              {selectedOption.sale_price && selectedOption.price > selectedOption.sale_price ? (
                <>
                  <span className="line-through text-gray-400 mr-2">{currency}{selectedOption.price}</span>
                  <span className="text-red-600 font-bold">{currency}{selectedOption.sale_price}</span>
                </>
              ) : (
                <span>{currency}{selectedOption.price}</span>
              )}
            </p>
          )}
          {/* 설명 */}
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>

          {/* 옵션 선택 (weight 등) */}
          <div className='flex flex-col gap-4 my-8'>
            {productData.options && productData.options.length > 0 && (
              <>
                <p>Select weight</p>
                <div className='flex gap-2'>
                  {productData.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOption(opt)}
                      className={`px-3 py-1 border rounded ${opt.weight === selectedOption.weight ? "bg-blue-100 border-blue-500" : "hover:bg-blue-50"}`}
                    >
                      {opt.weight}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {/* ADD TO CART */}
          <button className='bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-8 py-3 rounded-xl shadow-md shadow-blue-200 hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all duration-300 ease-in-out'>ADD TO CART</button>
          
          <hr className='mt-10 sm:4 '/>
          <div className='text-sm text-gray-500 mt-6 mb-12 flex flex-col gap-2'>
            <p>100% Original product</p>
            <p>Cash on delivery is available</p>
            <p>Easy return and exchange policy within 7 days</p>
          </div>
        </div>
      </div>
      {/* Description & Review section */}
      <div className='mt-0'>
        <div className='flex border-b'>
            <button className='px-6 py-3 text-sm font-semibold text-blue-600 border-b-2 border-blue-600  hover:text-blue-700 transition-colors duration-300'>Description</button>
            <button className='px-6 py-3 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-300'>Reviews(122)</button>
          </div>
          <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
            <p>{productData.description}</p>
          </div>
      </div>
    </div>
  )
}

export default Product
