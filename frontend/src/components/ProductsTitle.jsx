import React from 'react'

const ProductsTitle = ({ text1, text2 }) => {
  return (
    <div className="flex items-center gap-4 mb-6 justify-center"> {/* mb-12 → mb-4 */}
      <div className="w-12 h-1 bg-blue-400 rounded-full hidden sm:block"></div>
      <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-2 rounded-2xl shadow-md"> {/* px-8 → px-6, py-4 → py-2 */}
        <p className="text-xl sm:text-2xl font-bold tracking-wide text-gray-800">
          <span className="text-blue-500">{text1}</span>{' '}
          <span className="text-blue-700">{text2}</span>
        </p>
      </div>
      <div className="w-12 h-1 bg-blue-400 rounded-full hidden sm:block"></div>
    </div>
  )
}

export default ProductsTitle
