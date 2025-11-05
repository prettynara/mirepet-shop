import React, { useContext, useState, useEffect, useRef } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useRole } from '../context/RoleContext';
import ProductItem from '../components/ProductItem';
import axios from 'axios';

const MyProducts = () => {
  const { products, fetchProducts } = useContext(ShopContext);
  const { role } = useRole();
  const [myProducts, setMyProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sellerId, setSellerId] = useState(null);

  const initialFormState = {
    name: '',
    brand: '',
    description: '',
    category: '',
    subCategory: '',
    image: [], // can contain File objects or existing URL strings
    options: [
      { weight: '', price: 0, sale_price: 0, special_price: false }
    ],
  };
  const [formProduct, setFormProduct] = useState(initialFormState);

  const base = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  // preview URLs for images
  const [previewUrls, setPreviewUrls] = useState([]);
  const createdObjectUrlsRef = useRef([]);

  useEffect(() => {
    createdObjectUrlsRef.current.forEach(u => {
      try { URL.revokeObjectURL(u); } catch (e) {}
    });
    createdObjectUrlsRef.current = [];

    const urls = (formProduct.image || []).map(f => {
      if (typeof f === 'string') return f;
      const obj = URL.createObjectURL(f);
      createdObjectUrlsRef.current.push(obj);
      return obj;
    });
    setPreviewUrls(urls);

    return () => {
      createdObjectUrlsRef.current.forEach(u => {
        try { URL.revokeObjectURL(u); } catch (e) {}
      });
      createdObjectUrlsRef.current = [];
    };
  }, [formProduct.image]);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      if (u && (u._id || u.id)) setSellerId(u._id || u.id);
    } catch (e) {}
  }, []);

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true } : { withCredentials: true };
      const res = await axios.get(`${base}/api/product/list`, config);
      const all = Array.isArray(res.data.products) ? res.data.products : [];
      const sid = sellerId || '';
      const filtered = sid ? all.filter(p => String(p.seller) === String(sid)) : all;
      setMyProducts(filtered);
    } catch (err) {
      console.error('fetchMyProducts error', err);
      const sid = sellerId || '';
      setMyProducts(sid ? products.filter(p => String(p.seller) === String(sid)) : []);
    }
  };

  useEffect(() => {
    if (role !== 'seller') return;
    fetchMyProducts();
  }, [role, sellerId, products]);

  useEffect(() => {
    fetchMyProducts();
  }, [products]);

  const handleAddOption = () => {
    setFormProduct(prev => ({ ...prev, options: [...prev.options, { weight: '', price: 0, sale_price: 0, special_price: false }] }));
  };
  const handleRemoveOption = (idx) => {
    setFormProduct(prev => ({ ...prev, options: prev.options.filter((_, i) => i !== idx) }));
  };
  const handleOptionChange = (idx, key, value) => {
    setFormProduct(prev => {
      const opts = prev.options.slice();
      opts[idx] = { ...opts[idx], [key]: value };
      return { ...prev, options: opts };
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true } : { withCredentials: true };
      await axios.delete(`${base}/api/product/${id}`, config);
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
      // validation: at least one option and at least one image/url
      if (!formProduct.options || formProduct.options.length === 0) {
        alert('Please add at least one option (weight/price).'); return;
      }

      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` }, withCredentials: true } : { withCredentials: true };

      const fd = new FormData();
      fd.append('name', formProduct.name);
      fd.append('brand', formProduct.brand);
      fd.append('description', formProduct.description);
      fd.append('category', formProduct.category);
      fd.append('subCategory', formProduct.subCategory);
      fd.append('bestseller', 'false');

      // append options as JSON
      fd.append('options', JSON.stringify(formProduct.options));

      // separate new files and existing urls
      const newFiles = (formProduct.image || []).filter(f => !(typeof f === 'string'));
      const existingUrls = (formProduct.image || []).filter(f => typeof f === 'string');

      newFiles.forEach((file, idx) => {
        const field = `image${idx + 1}`;
        fd.append(field, file);
      });

      if (editingId) {
        // if no new files but existing URLs present, send existingImages so backend keeps them
        if (!newFiles.length && existingUrls.length) {
          fd.append('existingImages', JSON.stringify(existingUrls));
        }
        await axios.put(`${base}/api/product/${editingId}`, fd, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          withCredentials: true
        });
        setEditingId(null);
      } else {
        // new product: if no images selected, backend will validate
        await axios.post(`${base}/api/product/add`, fd, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          withCredentials: true
        });
      }

      setFormProduct(initialFormState);
      setShowForm(false);
      if (typeof fetchProducts === 'function') await fetchProducts();
      await fetchMyProducts();
    } catch (err) {
      console.error('save product error', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setFormProduct(prev => ({ ...prev, image: [...prev.image.filter(i => typeof i === 'string'), ...files] }));
  };

  const handleEditClick = (product) => {
    setEditingId(product._id);
    setFormProduct({
      name: product.name,
      brand: product.brand,
      description: product.description,
      category: product.category,
      subCategory: product.subCategory,
      image: Array.isArray(product.image) ? product.image.slice() : [],
      options: Array.isArray(product.options) && product.options.length ? product.options.map(o => ({
        weight: o.weight || '',
        price: o.price || 0,
        sale_price: o.sale_price || 0,
        special_price: !!o.special_price
      })) : [{ weight: '', price: 0, sale_price: 0, special_price: false }],
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

          <div className="border p-3 rounded">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">Options (weight / price)</p>
              <button type="button" onClick={handleAddOption} className="text-sm bg-green-500 text-white px-2 py-1 rounded">Add Option</button>
            </div>

            {formProduct.options.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center mb-2">
                <input type="text" placeholder="Weight (e.g. 2kg)" value={opt.weight} onChange={(e) => handleOptionChange(idx, 'weight', e.target.value)} className="border p-2 rounded w-32" />
                <input type="number" placeholder="Price" value={opt.price} onChange={(e) => handleOptionChange(idx, 'price', Number(e.target.value))} className="border p-2 rounded w-24" />
                <input type="number" placeholder="Sale Price" value={opt.sale_price} onChange={(e) => handleOptionChange(idx, 'sale_price', Number(e.target.value))} className="border p-2 rounded w-24" />
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={opt.special_price} onChange={(e) => handleOptionChange(idx, 'special_price', e.target.checked)} />
                  Special
                </label>
                {formProduct.options.length > 1 && (
                  <button type="button" onClick={() => handleRemoveOption(idx)} className="text-sm bg-red-500 text-white px-2 py-1 rounded">Remove</button>
                )}
              </div>
            ))}
          </div>

          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="border p-2 rounded" />
          <div className="flex gap-2 mt-2">
            {previewUrls.map((src, idx) => (
              <div key={idx} className="w-20 h-20 rounded bg-gray-100 p-1 flex items-center justify-center overflow-hidden">
                <img src={src} alt="preview" className="max-w-full max-h-full object-contain" />
              </div>
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