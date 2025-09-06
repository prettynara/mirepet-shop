import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import ProductsTitle from './ProductsTitle';

const CartTotal = () => {
  
  const {currency, delivery_fee, getCartAmount } = useContext(ShopContext);

    return (
    <div className='w-full'>
        <div className='text-xl mb-4'>
            <ProductsTitle text1={'CART'} text2={'TOTALS'} />
        </div>
      
       <div className='flex flex-col gap-3 text-base'>
            <div className='flex justify-between'>
                <p>SubTotal</p>
                <p>{currency} {getCartAmount()}.000</p>
            </div>
            <hr />
            <div className='flex justify-between'>
                <p>Delivery Fee</p>
                <p>{currency} {delivery_fee}.000</p>
            </div>
            <hr />
            <div className='flex justify-between font-semibold'>
                <b>Total</b>
                <b>{currency} {getCartAmount() === 0 ? 0 : getCartAmount() + delivery_fee}.000</b>
            </div>
       </div> 
    </div>
  )
}

export default CartTotal
