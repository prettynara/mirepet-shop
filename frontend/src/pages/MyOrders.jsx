import React, { useContext, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import ProductsTitle from "../components/ProductsTitle";

const MyOrders = () => {
  const { products, currency } = useContext(ShopContext);

  const [orderStatus, setOrderStatus] = useState({}); // 주문 상태 관리

  const handleStatusChange = (index, status) => {
    setOrderStatus((prev) => ({
      ...prev,
      [index]: status,
    }));
  }

  const colorMap = {
    "Mark Ready": "bg-yellow-400 text-white",
    "Out for Delivery": "bg-blue-500 text-white",
    "Mark Delivered": "bg-green-500 text-white",
    "Out of Stock": "bg-red-500 text-white",
  };

  return (
    <div className="border-t pt-14 px-4 sm:px-8 lg:px-20 min-h-[80vh]">
      {/* Title */}
      <div className="text-2xl mb-8">
        <ProductsTitle text1="NEW" text2="ORDERS" />
      </div>

      {/* 주문 내역 리스트 (products 중 일부를 주문처럼 표시) */}
      <div className="flex flex-col gap-6">
        {products.slice(2, 5).map((item, index) => {
          const option = item.options?.[0];

          // 가격 계산
          const price = option?.sale_price || option?.price;
          const currentStatus = orderStatus[index];

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-all"
            >
              {/* 주문 상단: 주문번호 + 날짜 */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-lg">Order #{1000 + index}</p>
                  {currentStatus && (
                    <span
                      className={`px-4 py-1.5 rounded text-sm font-medium opacity-90 cursor-default ${colorMap[currentStatus]}`}
                    >
                      {currentStatus}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm">17 Sep, 2025</p>
              </div>

              {/* 주문 상품 정보 */}
              <div className="flex items-start gap-4">
                <img
                  className="w-20 h-20 object-cover rounded-md"
                  src={item.image[0]}
                  alt={item.name}
                />
                <div className="flex-1">
                  <p className="font-medium text-base sm:text-lg">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <p className="font-semibold">
                      {currency}
                      {price}
                    </p>
                    <span className="px-2 py-1 border rounded bg-slate-50">
                      Qty: 1
                    </span>
                    <span className="px-2 py-1 border rounded bg-slate-50">
                      {option?.weight || "M"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 주문자 정보 */}
              <div className="mt-4 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Customer:</span> John Doe
                </p>
                <p>
                  <span className="font-medium">Address:</span> Tunis, Tunisia
                </p>
                <p>
                  <span className="font-medium">Phone:</span> +21612345678
                </p>
              </div>

              {/* 주문 상태 변경 버튼 */}
              <div className="mt-4 flex gap-3 flex-wrap">
                {Object.keys(colorMap).map((status, i) => {
                  const isActive = currentStatus === status;
                  return (
                      <button
                        key={i}
                        onClick={() => handleStatusChange(index, status)}
                        className={`${colorMap[status]} ${
                          isActive ? "ring-4 ring-offset-2 ring-gray-300" : ""
                        } px-4 py-2 rounded text-white text-sm transition`}
                      >
                        {status}
                      </button>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
