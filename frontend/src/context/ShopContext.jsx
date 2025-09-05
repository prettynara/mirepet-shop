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

    const value = {
        products,
        currency,
        delivery_fee,
        weight,
        search, setSearch,showSearch,setShowSearch,
        cartItems, addToCart,
        getCartCount
    }
  
    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;
