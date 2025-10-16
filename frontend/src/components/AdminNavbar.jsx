import React from 'react'
import { assets } from './../assets/assets';

const AdminNavbar = () => {
  return (
    <div>
      {/* Logo */}
      <img src={assets.logo} className='w-36' alt="" />
      <button>Logout</button>
    </div>
  )
}

export default AdminNavbar
