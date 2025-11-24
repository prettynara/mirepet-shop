import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';

const ProductItem = ({
  id,
  image = [],
  name = '',
  seller = '',
  sellerName = '',
  sellerLogo = '',
  option = {},
  showDiscount = true,
}) => {
  const { currency = '' } = useContext(ShopContext);

  // seller 정보 추출
  const extractedSellerName =
  (seller && typeof seller === 'object' ? seller.petshopName || seller.name : null) || sellerName ||
  'Seller';

  const extractedSellerLogo =
  (seller && typeof seller === 'object' ? seller.logo : null) || sellerLogo ||
  null;

  const rawPrice = Number(option?.price) || 0;
  const salePrice = (typeof option?.sale_price !== 'undefined' && option.sale_price !== null) 
  ? Number(option.sale_price) 
  : null;

  // 변경: 할인 여부는 special_price 플래그가 true일 때만 인정
  const hasDiscount = option?.special_price === true && salePrice !== null && salePrice < rawPrice;
  const displayPrice = hasDiscount ? salePrice : rawPrice;
  const discountPct = hasDiscount && rawPrice > 0 
  ? Math.round(((rawPrice - salePrice) / rawPrice) * 100) 
  : 0;

  const weight = option?.weight || option?.quantity || '';
  const imgSrc = Array.isArray(image) && image.length ? image[0] : (assets?.placeholder || '');

  return (
    <Link to={`/product/${id}`} className="block text-gray-800">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden relative">
        {/* 할인 배지 */}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-lg shadow z-10">
            -{discountPct}%
          </span>
        )}

        {/* 이미지 */}
        <div className="w-full h-44 bg-gray-100 overflow-hidden">
          <img
            src={imgSrc}
            alt={name || 'product'}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* 정보: name -> price (원가+할인가 표시) -> weight -> seller(logo + name) */}
        <div className="p-3">
          <p className="text-sm font-medium mb-1 line-clamp-2">{name}</p>

          <div className="mb-1">
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-400 line-through">{currency}{rawPrice}</span>
                <span className="text-base font-bold text-red-600">{currency}{displayPrice}</span>
              </div>
            ) : (
              <p className="text-base font-bold">{currency}{displayPrice}</p>
            )}
          </div>

          {weight ? ( <p className="text-sm text-gray-600 mb-3">{weight}</p>
          ) : ( 
             <div className="mb-3" />
            )}

          <div className="flex items-center gap-2 pt-2">
            {extractedSellerLogo ? (
              <img src={extractedSellerLogo} alt={extractedSellerName} 
              className="w-6 h-6 rounded-full object-cover border border-gray-200"/>
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-gray-500 text-xs border border-gray-200" />
            )}
            <span className="text-sm font-semibold text-gray-700 truncate flex-1">{extractedSellerName}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;