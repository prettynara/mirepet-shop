import React from 'react'

const Title = ({text1, text2}) => {
  return (
    <div className='inline-flex gap-2 items-center mb-3'>
      <div className="bg-blue-50 px-6 py-3 rounded-xl shadow-md inline-flex items-center gap-2">
      <p className='text-blue-500'>{text1} <span className='text-blue-600 font-semibold'>{text2}</span></p>
      <p className='w-10 h-1 bg-blue-300 rounded-full hidden sm:inline-block'></p>
      </div>
    </div>
  )
}

export default Title
