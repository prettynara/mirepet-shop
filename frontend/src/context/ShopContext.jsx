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
      setProducts(initialProducts || []);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // add item to cart (option may have weight or quantity)
  const addToCart = async (itemId, option) => {
    // use only nullish coalescing to avoid parser issues
    const optionKey = String(option?.weight ?? option?.quantity ?? "default");
    const cartData = structuredClone(cartItems) || {};
    if (!cartData[itemId]) cartData[itemId] = {};
    const prev = Number(cartData[itemId][optionKey] || 0);
    cartData[itemId][optionKey] = prev + 1;
    setCartItems(cartData);
    try {
      localStorage.setItem("cart", JSON.stringify(cartData));
    } catch (e) {}
  };

  // get total count of items in cart
  const getCartCount = () => {
    let totalCount = 0;
    if (!cartItems || typeof cartItems !== "object") return 0;
    // only count items for products that actually exist (backend or bundled)
    const validIds = new Set([
      ...(products || []).map((p) => p._id),
      ...(initialProducts || []).map((p) => p._id),
    ]);
    for (const productId of Object.keys(cartItems)) {
      if (!validIds.has(productId)) continue;
      const opts = cartItems[productId] || {};
      if (typeof opts !== "object") continue;
      for (const optKey of Object.keys(opts)) {
        const raw = opts[optKey];
        const qty = Number(raw || 0);
        if (Number.isFinite(qty) && qty > 0) totalCount += qty;
      }
    }
    return totalCount;
  };

  // keep cartItems sanitized once products are loaded
  useEffect(() => {
    if (!products || products.length === 0) return;
    const validIds = new Set([
      ...products.map((p) => p._id),
      ...initialProducts.map((p) => p._id),
    ]);
    let changed = false;
    const cleaned = {};
    for (const pid of Object.keys(cartItems || {})) {
      if (!validIds.has(pid)) {
        changed = true;
        continue;
      }
      const opts = cartItems[pid];
      if (!opts || typeof opts !== "object") {
        changed = true;
        continue;
      }
      const out = {};
      for (const ok of Object.keys(opts)) {
        const n = Number(opts[ok] || 0);
        if (Number.isFinite(n) && n > 0) out[String(ok)] = n;
      }
      if (Object.keys(out).length) cleaned[pid] = out;
      else changed = true;
    }
    if (changed) setCartItems(Object.keys(cleaned).length ? cleaned : {});
  }, [products]);

  // update quantity (remove option or product when quantity <= 0)
  const updateQuantity = async (itemId, option, quantity) => {
    const optionKey = String(option ?? "default");
    const q = Number(quantity) || 0;
    const cartData = structuredClone(cartItems) || {};
    if (!cartData[itemId]) cartData[itemId] = {};
    if (q <= 0) {
      delete cartData[itemId][optionKey];
      if (Object.keys(cartData[itemId]).length === 0) delete cartData[itemId];
    } else {
      cartData[itemId][optionKey] = q;
    }
    setCartItems(cartData);
    try {
      localStorage.setItem("cart", JSON.stringify(cartData));
    } catch (e) {}
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
      const itemInfo =
        products.find((p) => p._id === itemId) ||
        initialProducts.find((p) => p._id === itemId);
      if (!itemInfo) continue;
      for (const optionKey in cartItems[itemId]) {
        const quantity = Number(cartItems[itemId][optionKey] || 0);
        if (quantity <= 0) continue;
        const option =
          itemInfo.options?.find(
            (o) => String(o.weight) === String(optionKey) || String(o.quantity) === String(optionKey)
          ) || {};
        const price =
          option?.sale_price && option.sale_price < option.price
            ? option.sale_price
            : option?.price || 0;
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

  const getProductsData = async () => {
  try {
    const response = await axios.get(`${backendUrl}/api/product/list`);
    
    if (response.data.success) {
      // ✅ seller 정보가 포함된 제품 데이터 저장
      const productsWithSeller = response.data.products.map(p => {
        // seller가 객체면 그대로, 아니면 sellerName/sellerLogo 사용
        const sellerObj = p.seller && typeof p.seller === 'object' ? p.seller : null;
        
        return {
          ...p,
          // seller 객체 유지
          seller: sellerObj || p.seller,
          // fallback용 필드
          sellerName: p.sellerName || sellerObj?.petshopName || sellerObj?.name || '',
          sellerLogo: p.sellerLogo || sellerObj?.logo || ''
        };
      });
      
      setProducts(productsWithSeller);
      console.log('✅ Products loaded with seller info:', productsWithSeller.length);
      
      // 디버깅: 첫 번째 제품의 seller 정보 출력
      if (productsWithSeller.length > 0) {
        console.log('Sample product seller info:', {
          seller: productsWithSeller[0].seller,
          sellerName: productsWithSeller[0].sellerName,
          sellerLogo: productsWithSeller[0].sellerLogo
        });
      }
    } else {
      toast.error(response.data.message);
    }
  } catch (error) {
    console.error('❌ getProductsData error:', error);
    toast.error(error.message);
  }
};

  // hydrate cart from localStorage on mount
  useEffect(() => {
    try {
      // prefer 'cart' key, fallback legacy 'cartItems'
      let raw = null;
      raw = JSON.parse(localStorage.getItem("cart") || "null");
      if (!raw) raw = JSON.parse(localStorage.getItem("cartItems") || "null");
      // only accept well-formed object: { productId: {optionKey: number }}
      if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        const normalized = {};
        for (const pid of Object.keys(raw)) {
          const opts = raw[pid];
          if (!opts || typeof opts !== "object") continue;
          const outOpts = {};
          for (const ok of Object.keys(opts)) {
            const n = Number(opts[ok] || 0);
            if (Number.isFinite(n) && n > 0) outOpts[String(ok)] = n;
          }
          if (Object.keys(outOpts).length) normalized[pid] = outOpts;
        }
        setCartItems(Object.keys(normalized).length ? normalized : {});
      } else {
        setCartItems({});
      }
    } catch (e) {
      setCartItems({});
    }
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
    getProductsData
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export default ShopProvider;