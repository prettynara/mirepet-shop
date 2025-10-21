import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Product from './pages/Product';
import Products from './pages/Products';
import Login from './pages/Login';
import CustomerInfo from './pages/CustomerInfo';
import SellerInfo from './pages/SellerInfo';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import MyOrders from './pages/MyOrders';
import MyProducts from './pages/MyProducts';
import Sellers from './pages/Sellers';
import UploadProduct from './pages/UploadProduct';
import Navbar from './components/Navbar';
import SellerNavbar from './components/SellerNavbar';
import AdminNavbar from './components/AdminNavbar';
import { useRole } from './context/RoleContext';
import Footer from './components/Footer';
import SearchBar from './components/SearchBar';
import { ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  // const { role } = useRole(); 
  const { role, setRole } = useRole(); //임의로 admin 설정
  useEffect(() => {   //임의로 admin 설정
    setRole("seller"); //임의로 admin 설정
  }, []); //임의로 admin 설정 

  let navbarComponent = <Navbar />;
  if (role === 'seller') navbarComponent = <SellerNavbar />;
  if (role === 'admin') navbarComponent = <AdminNavbar />;

  return (
    <div className = 'pt-28 px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer />
      {navbarComponent}
      <SearchBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/product/:productId' element={<Product />} />
        <Route path='/products' element={<Products />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<Login />} />
        <Route path="/customer-info" element={<CustomerInfo />} />
        <Route path="/seller-info" element={<SellerInfo />} />
        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/myorders' element={<MyOrders />} />
        <Route path='/myproducts' element={<MyProducts />} />
        <Route path='/sellers' element={<Sellers />} />
        <Route path='/upload-product' element={<UploadProduct />} />
      </Routes>
      <Footer/>
    </div>
  );
};

export default App;
