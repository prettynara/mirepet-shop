import { createContext, useState } from "react";
import { products } from "../assets/assets";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = 'TND';
    const delivery_fee = 10;
    const weight = 'kg';
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);    
    const [cartItems, setCartItems] = useState({});

    const addToCart = async (itemId, option) => {

        let cartData = structuredClone(cartItems);

        // options를 문자열 key로 변환
        const optionKey = option.weight || option.quantity; // weight나 quantity로 구분

        if (cartData[itemId]) {
            if (cartData[itemId][optionKey]) {
                cartData[itemId][optionKey] += 1;
            }
            else{
                cartData[itemId][optionKey] = 1;
            }
        }
        else {
            cartData[itemId] = {};
            cartData[itemId][optionKey] = 1;
        }
        setCartItems(cartData);

    }

    const getCartCount = () => {
        let totalCount = 0;
        for(const items in cartItems){
            for(const item in cartItems[items]){
                try {
                    if (cartItems[items][item] > 0 ) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {
                }
            }
        }
        return totalCount;
    }

    {/*
    useEffect(() => {
        console.log(cartItems);
    },[cartItems])
    */}

    const updateQuantity = async (itemId, option, quantity) => {

            let cartData = structuredClone(cartItems);

            cartData[itemId][option] = quantity;

            setCartItems(cartData);
    }

    const getCartAmount =  () => {
        let totalAmount = 0;
        
        for(const itemId in cartItems){
            let itemInfo = products.find((product)=> product._id === itemId);
            if (!itemInfo) continue;
            
            for(const optionKey in cartItems[itemId]){
                const quantity = cartItems[itemId][optionKey];
                if (quantity > 0) {
                    // 옵션 찾기
                    const option = itemInfo.options?.find(
                    o => o.weight === optionKey || o.quantity === optionKey
                );

                // 옵션 가격: sale_price가 있으면 사용, 없으면 기본 price
                const price = option?.sale_price && option.sale_price < option.price ? option.sale_price : option?.price || 0;

                totalAmount += price * quantity;
                }
            }
        }
        return totalAmount;
    }

    const value = {
        products,
        currency,
        delivery_fee,
        weight,
        search, setSearch,showSearch,setShowSearch,
        cartItems, addToCart,
        getCartCount, updateQuantity,
        getCartAmount
    }
  
    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;
