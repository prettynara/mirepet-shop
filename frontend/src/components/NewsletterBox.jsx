import React from 'react'

const NewsletterBox = () => {

    const onSubmitHandler = (event) => {
        event.preventDefault();
    }

  return (
    <div className="bg-gray-50 py-12 px-6 mt-4 rounded-2xl shadow-sm">
    <div className='text-center max-w-2xl mx-auto'>

        {/* 제목 */}
        <h2 className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent'>Subscribe to Our Newsletter</h2>
        <p className='text-gray-500 mt-3 text-sm sm:text-base'>Be the first to know about our latest offers and special deals!</p>
        
        {/* 입력박스 */}
        <form onSubmit={onSubmitHandler} className='mt-8 w-full max-w-lg mx-auto flex flex-col sm:flex-row items-center gap-3 bg-white shadow-md rounded-xl p-3 border border-gray-200'>
            <input className='flex-1 w-full px-4 py-3 rounded-lg outline-none text-sm border border-gray-200 focus:ring-2 focus:ring-blue-400 transition' type="email" placeholder = 'Enter your email' required />
            <button type='submit' className='bg-blue-600 hover:bg-blue-700 transition-colors text-white text-sm font-medium px-8 py-3 rounded-lg shadow'>SUBSCRIBE</button>
        </form>
    </div>
    </div>
  )
}

export default NewsletterBox
