import React, { useContext, useState, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useRole } from '../context/RoleContext';
import ProductItem from '../components/ProductItem';

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

  const categories = [
    'Food', 'Treat', 'Toy', 'Health Care', 'Cleaning Supplies', 'Accessories', 'Comfort', 'Others'
  ];
  const subCategories = ['Dog', 'Cat', 'Bird', 'Fish', 'Others'];

  // 현재 셀러 상품만 필터링
  useEffect(() => {
    if (role !== 'seller') return;
    const filtered = products.filter(p => p.seller === currentSeller);
    setMyProducts(filtered);
  }, [products, role, currentSeller]);

  const handleDelete = (id) => {
    setMyProducts(prev => prev.filter(p => p._id !== id));
  };

  const handleEdit = (product) => {
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
      image: [], // 새로 업로드할 이미지
    });
    setShowForm(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const imageUrls = formProduct.image.length
      ? formProduct.image.map(file => URL.createObjectURL(file))
      : [];

    if (editingId) {
      setMyProducts(prev =>
        prev.map(p => p._id === editingId ? {
          ...p,
          name: formProduct.name,
          brand: formProduct.brand,
          description: formProduct.description,
          category: formProduct.category,
          subCategory: formProduct.subCategory,
          image: imageUrls.length ? imageUrls : p.image,
          options: [{
            weight: '',
            price: formProduct.price,
            sale_price: formProduct.sale_price,
            special_price: formProduct.special_price
          }]
        } : p)
      );
    } else {
      const id = `new-${Date.now()}`;
      setMyProducts(prev => [
        ...prev,
        {
          _id: id,
          seller: currentSeller, // 로그인한 셀러 자동 적용
          name: formProduct.name,
          brand: formProduct.brand,
          description: formProduct.description,
          category: formProduct.category,
          subCategory: formProduct.subCategory,
          image: imageUrls,
          options: [{
            weight: '',
            price: formProduct.price,
            sale_price: formProduct.sale_price,
            special_price: formProduct.special_price
          }]
        }
      ]);
    }

    // 초기화
    setEditingId(null);
    setFormProduct(initialFormState);
    setShowForm(false);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setFormProduct(prev => ({ ...prev, image: files }));
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
          <input type="text" placeholder="Product Name" value={formProduct.name} onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })} className="border p-2 rounded"/>
          <input type="text" placeholder="Brand" value={formProduct.brand} onChange={(e) => setFormProduct({ ...formProduct, brand: e.target.value })} className="border p-2 rounded"/>
          <textarea placeholder="Description" value={formProduct.description} onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })} className="border p-2 rounded"/>
          
          <select value={formProduct.category} onChange={(e) => setFormProduct({ ...formProduct, category: e.target.value })} className="border p-2 rounded">
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select value={formProduct.subCategory} onChange={(e) => setFormProduct({ ...formProduct, subCategory: e.target.value })} className="border p-2 rounded">
            <option value="">Select SubCategory</option>
            {subCategories.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>

          <input type="number" placeholder="Price" value={formProduct.price} onChange={(e) => setFormProduct({ ...formProduct, price: Number(e.target.value) })} className="border p-2 rounded"/>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Sale Price" value={formProduct.sale_price} onChange={(e) => setFormProduct({ ...formProduct, sale_price: Number(e.target.value) })} className="border p-2 rounded"/>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={formProduct.special_price} onChange={(e) => setFormProduct({ ...formProduct, special_price: e.target.checked })}/>
              Special Price
            </label>
          </div>

          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="border p-2 rounded"/>
          <div className="flex gap-2 mt-2">
            {formProduct.image.map((file, idx) => (
              <img key={idx} src={URL.createObjectURL(file)} alt="preview" className="w-20 h-20 object-cover rounded"/>
            ))}
          </div>

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">{editingId ? 'Update Product' : 'Save Product'}</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {myProducts.map(p => (
          <div key={p._id} className="relative bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow">
            <ProductItem id={p._id} image={p.image} name={p.name} seller={p.seller} option={p.options[0]} />
            <div className="absolute top-2 right-2 flex gap-2">
              <button onClick={() => handleEdit(p)} className="bg-yellow-400 hover:bg-yellow-500 px-2 py-1 rounded text-white shadow">Edit</button>
              <button onClick={() => handleDelete(p._id)} className="bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-white shadow">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyProducts;
