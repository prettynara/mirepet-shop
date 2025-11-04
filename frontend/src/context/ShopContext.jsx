import React, { createContext, useState, useEffect } from "react";
import { products as initialProducts } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
  const navigate = useNavigate();

  // products list (from backend when available)
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [currentSeller, setCurrentSeller] = useState("Animax");
  const [orders, setOrders] = useState([]);

  const currency = "TND";
  const delivery_fee = 10;
  const weight = "kg";

  // Fetch latest products from backend; fallback to bundled assets
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        : { withCredentials: true };
      const res = await axios.get(`${API_BASE}/api/product/list`, config);
      const list = Array.isArray(res.data?.products) ? res.data.products : [];
      if (list.length) setProducts(list);
      else setProducts(initialProducts || []);
    } catch (err) {
      console.error("fetchProducts error", err);
      // fallback to bundled assets
      setProducts(initialProducts || []);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const addToCart = async (itemId, option) => {
    const optionKey = option?.weight || option?.quantity;
    const cartData = structuredClone(cartItems);
    if (!cartData[itemId]) cartData[itemId] = {};
    cartData[itemId][optionKey] = (cartData[itemId][optionKey] || 0) + 1;
    setCartItems(cartData);
    try { localStorage.setItem("cart", JSON.stringify(cartData)); } catch (e) {}
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const productId in cartItems) {
      for (const opt in cartItems[productId]) {
        const qty = cartItems[productId][opt];
        if (typeof qty === "number" && qty > 0) totalCount += qty;
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, option, quantity) => {
    const cartData = structuredClone(cartItems);
    if (!cartData[itemId]) cartData[itemId] = {};
    cartData[itemId][option] = quantity;
    setCartItems(cartData);
    try { localStorage.setItem("cart", JSON.stringify(cartData)); } catch (e) {}
  };

  const clearCart = () => {
    setCartItems({});
    try {
      localStorage.removeItem("cart");
      localStorage.removeItem("cartItems");
    } catch (e) {}
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = products.find((p) => p._id === itemId) || initialProducts.find((p) => p._id === itemId);
      if (!itemInfo) continue;
      for (const optionKey in cartItems[itemId]) {
        const quantity = cartItems[itemId][optionKey];
        if (quantity <= 0) continue;
        const option = itemInfo.options?.find((o) => o.weight === optionKey || o.quantity === optionKey) || {};
        const price = option?.sale_price && option.sale_price < option.price ? option.sale_price : option?.price || 0;
        totalAmount += price * quantity;
      }
    }
    return totalAmount;
  };

  // Orders
  const placeOrder = (orderData) => {
    setOrders((prev) => [{ ...orderData, status: "pending" }, ...prev]);
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  // hydrate cart from localStorage on mount
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem("cart") || "null");
      if (c && typeof c === "object") setCartItems(c);
    } catch (e) {}
    try {
      const ord = JSON.parse(localStorage.getItem("orders") || "null");
      if (Array.isArray(ord)) setOrders(ord);
    } catch (e) {}
  }, []);

  // persist orders to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("orders", JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  const value = {
    products,
    setProducts,
    fetchProducts,
    currency,
    delivery_fee,
    weight,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    clearCart,
    getCartAmount,
    navigate,
    currentSeller,
    setCurrentSeller,
    orders,
    setOrders,
    placeOrder,
    updateOrderStatus,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopProvider;