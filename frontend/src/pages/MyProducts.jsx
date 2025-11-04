import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useRole } from '../context/RoleContext';
import ProductItem from '../components/ProductItem';
import axios from 'axios';

const MyProducts = () => {
  const { products, currency, currentSeller } = useContext(ShopContext);
  const { role } = useRole();
  const [myProducts, setMyProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    name: '',
    brand: '',
    description: '',
    category: '',
    subCategory: '',
    price: 0,
    sale_price: 0,
    special_price: false,
    image: [],
  };
  const [formProduct, setFormProduct] = useState(initialFormState);

  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // fetch latest products from backend and filter by current seller
  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true } : { withCredentials: true };
      const res = await axios.get(`${base}/api/product/list`, config);
      const all = Array.isArray(res.data.products) ? res.data.products : [];
      const filtered = all.filter(p => String(p.seller) === String(currentSeller));
      setMyProducts(filtered);
    } catch (err) {
      console.error('fetchMyProducts error', err);
      // fallback to context products if backend fails
      setMyProducts(products.filter(p => p.seller === currentSeller));
    }
  }

  useEffect(() => {
    if (role !== 'seller') return;
    fetchMyProducts();
  }, [role, currentSeller, products]);

  useEffect(() => {
    fetchMyProducts();
  }, [products]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      const token = localStorage.getItem('token'); 
      const config = token ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true } : { withCredentials: true };
      await axios.delete(`${base}/api/product/${id}`, config);
      // refresh UI : update global products and seller list
      if (typeof fetchProducts === 'function') await fetchProducts();
      await fetchMyProducts();
    } catch (err) {
      console.error('Delete product error', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true } : { withCredentials: true };
    
     // build FormData for images + fields
      const fd = new FormData();
      fd.append('name', formProduct.name);
      fd.append('brand', formProduct.brand);
      fd.append('description', formProduct.description);
      fd.append('category', formProduct.category);
      fd.append('subCategory', formProduct.subCategory);
      fd.append('bestseller', 'false');
      // options as JSON string (single option from price fields)
      const options = [{ weight: '', price: formProduct.price, sale_price: formProduct.sale_price, special_price: formProduct.special_price }];
      fd.append('options', JSON.stringify(options));

      // attach files
      formProduct.image.forEach((file, idx) => {
        fd.append(`image${idx+1}`, file);
      });

      // POST to backend add endpoint
      await axios.post(`${base}/api/product/add`, fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        withCredentials: true
      });

      // reset & refresh: update global products so Products/Products update
      setFormProduct(initialFormState);
      setShowForm(false);
      if (typeof fetchProducts === 'function') await fetchProducts();
      await fetchMyProducts();
    } catch (err) {
      console.error('save product error', err.response?.data || err.message);
      alert('Failed to save product');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setFormProduct(prev => ({ ...prev, image: files }));
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setFormProduct({
      name: product.name,
      brand: product.brand,
      description: product.description,
      category: product.category,
      subCategory: product.subCategory,
      price: product.options[0]?.price || 0,
      sale_price: product.options[0]?.sale_price || 0,
      special_price: product.options[0]?.special_price || false,
      image: [], // new uploads
    });
    setShowForm(true);
  };

  return (
    <div className="max-w-6xl mx-auto mt-20 px-4">
      <h2 className="text-2xl font-semibold mb-6">My Products</h2>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
        onClick={() => { setShowForm(!showForm); setEditingId(null); setFormProduct(initialFormState); }}
      >
        {showForm ? 'Cancel' : 'Add Product'}
      </button>

      {showForm && (
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 mb-6 p-4 border rounded-lg bg-gray-50">
          <input type="text" placeholder="Product Name" value={formProduct.name} onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })} className="border p-2 rounded" required />
          <input type="text" placeholder="Brand" value={formProduct.brand} onChange={(e) => setFormProduct({ ...formProduct, brand: e.target.value })} className="border p-2 rounded" />
          <textarea placeholder="Description" value={formProduct.description} onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })} className="border p-2 rounded" required />
          
          <select value={formProduct.category} onChange={(e) => setFormProduct({ ...formProduct, category: e.target.value })} className="border p-2 rounded" required>
            <option value="">Select Category</option>
            <option>Food</option><option>Treat</option><option>Toy</option><option>Health Care</option><option>Cleaning Supplies</option><option>Accessories</option><option>Comfort</option><option>Others</option>
          </select>

          <select value={formProduct.subCategory} onChange={(e) => setFormProduct({ ...formProduct, subCategory: e.target.value })} className="border p-2 rounded" required>
            <option value="">Select SubCategory</option>
            <option>Dog</option><option>Cat</option><option>Bird</option><option>Fish</option><option>Others</option>
          </select>

          <input type="number" placeholder="Price" value={formProduct.price} onChange={(e) => setFormProduct({ ...formProduct, price: Number(e.target.value) })} className="border p-2 rounded" required />
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Sale Price" value={formProduct.sale_price} onChange={(e) => setFormProduct({ ...formProduct, sale_price: Number(e.target.value) })} className="border p-2 rounded" />
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={formProduct.special_price} onChange={(e) => setFormProduct({ ...formProduct, special_price: e.target.checked })}/>
              Special Price
            </label>
          </div>

          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="border p-2 rounded" />
          <div className="flex gap-2 mt-2">
            {formProduct.image.map((file, idx) => (
              <img key={idx} src={URL.createObjectURL(file)} alt="preview" className="w-20 h-20 object-cover rounded" />
            ))}
          </div>

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{editingId ? 'Update Product' : 'Save Product'}</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {myProducts.map(p => (
          <div key={p._id} className="relative bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow">
            <ProductItem id={p._id} image={p.image} name={p.name} seller={p.seller} sellerName={p.sellerName} sellerLogo={p.sellerLogo} option={p.options?.[0]} />
            <div className="absolute top-2 right-2 flex gap-2">
              <button onClick={() => handleEditClick(p)} className="bg-yellow-400 hover:bg-yellow-500 px-2 py-1 rounded text-white shadow">Edit</button>
              <button onClick={() => handleDelete(p._id)} className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-white shadow">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyProducts;
