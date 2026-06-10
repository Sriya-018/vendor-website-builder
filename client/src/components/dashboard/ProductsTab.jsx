import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaImage, FaGlobe } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

function ProductsTab({ businessId, websites }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeWebsiteId, setActiveWebsiteId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'general',
    description: '',
    image: null,
    imagePreview: null
  });

  useEffect(() => {
    fetchProducts();
  }, [businessId]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      // Fetch ALL products for the business
      const res = await axios.get(`${API_URL}/business/${businessId}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', category: 'general', description: '', image: null, imagePreview: null });
    setEditingProduct(null);
    setActiveWebsiteId(null);
    setShowAddModal(false);
  };

  const handleAddClick = (websiteId) => {
    setActiveWebsiteId(websiteId);
    setShowAddModal(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setActiveWebsiteId(product.websiteId);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category || 'general',
      description: product.description || '',
      image: null,
      imagePreview: product.imageUrl ? `http://localhost:5000${product.imageUrl}` : null
    });
    setShowAddModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`${API_URL}/business/products/${productId}`);
        setProducts(products.filter(p => p._id !== productId));
      } catch (error) {
        console.error('Failed to delete product', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let finalImageUrl = editingProduct ? editingProduct.imageUrl : '';
      
      // Upload image if a new one was selected
      if (formData.image) {
        const imageForm = new FormData();
        imageForm.append('image', formData.image);
        const uploadRes = await axios.post(`${API_URL}/upload/product-image`, imageForm);
        finalImageUrl = uploadRes.data.url;
      }

      const productPayload = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        imageUrl: finalImageUrl,
        websiteId: activeWebsiteId
      };

      if (editingProduct) {
        // Update
        const res = await axios.put(`${API_URL}/business/products/${editingProduct._id}`, productPayload);
        setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
      } else {
        // Create
        const res = await axios.post(`${API_URL}/business/${businessId}/products`, productPayload);
        setProducts([...products, res.data]);
      }
      resetForm();
    } catch (error) {
      console.error('Failed to save product', error);
      alert('Error saving product. Please try again.');
    }
  };

  if (!websites || websites.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-12 text-center">
        <FaGlobe className="text-5xl text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Storefronts Found</h2>
        <p className="text-gray-500 mb-6">Create a store from the Overview tab before managing products.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading products...</div>;
  }

  return (
    <div className="space-y-8">
      {websites.map((website) => {
        const websiteProducts = products.filter(p => p.websiteId === website._id);
        
        return (
          <div key={website._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaGlobe className="text-blue-500" />
                  Storefront: <span className="font-medium text-gray-700">{website.slug}</span>
                </h2>
                <p className="text-sm text-gray-500">Manage products for this specific website</p>
              </div>
              <button
                onClick={() => handleAddClick(website._id)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                <FaPlus /> Add Product
              </button>
            </div>

            {websiteProducts.length === 0 ? (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 text-2xl">
                  <FaImage />
                </div>
                <p className="text-lg font-medium text-gray-900">No products yet</p>
                <p className="mt-1 mb-6">Add products to display them on {website.slug}.</p>
                <button
                  onClick={() => handleAddClick(website._id)}
                  className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 shadow-sm"
                >
                  <FaPlus /> Add Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                      <th className="px-6 py-4 font-medium">Product</th>
                      <th className="px-6 py-4 font-medium">Price</th>
                      <th className="px-6 py-4 font-medium">Category</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-sm">
                    {websiteProducts.map(product => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} 
                                alt={product.name} 
                                className="w-12 h-12 rounded object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                <FaImage />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium">₹{product.price.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 capitalize">
                            {product.category || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 p-2 mr-2">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 p-2">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}

      {/* Unassigned / Legacy Products */}
      {products.filter(p => !p.websiteId).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaImage className="text-gray-500" />
              Unassigned Products
            </h2>
            <p className="text-sm text-gray-500">Older products that are not assigned to a specific storefront.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {products.filter(p => !p.websiteId).map(product => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} 
                            alt={product.name} 
                            className="w-12 h-12 rounded object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                            <FaImage />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">₹{product.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 capitalize">
                        {product.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 p-2 mr-2">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 p-2">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <div className="flex items-center gap-4">
                  {formData.imagePreview ? (
                    <img src={formData.imagePreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <FaImage className="text-2xl" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input 
                  type="text" required name="name" 
                  value={formData.name} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="e.g. Blue T-Shirt"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                  <input 
                    type="number" required min="0" step="0.01" name="price" 
                    value={formData.price} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input 
                    type="text" name="category" 
                    value={formData.category} onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="e.g. Clothing"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  name="description" rows="3"
                  value={formData.description} onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
                  placeholder="Briefly describe this product..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsTab;
