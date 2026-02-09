import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './admin.css';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    material: '',
    description: '',
    image: '',
    featuresText: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, productRes] = await Promise.all([
          axios.get('http://localhost:5000/api/categories'),
          isEdit ? axios.get(`http://localhost:5000/api/products/${id}`) : Promise.resolve(null)
        ]);

        setCategories(categoriesRes.data);

        if (isEdit && productRes) {
          const product = productRes.data;
          setFormData({
            name: product.name || '',
            category: product.category?._id || '',
            material: product.material || '',
            description: product.description || '',
            image: product.image || '',
            featuresText: (product.features || []).join(', ')
          });
          setImagePreview(product.image || '');
        }
      } catch {
        setError('Failed to load product data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleImageChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      image: value
    }));
    setImagePreview(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name.trim()) {
      setError('Product name is required');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const payload = {
        name: formData.name.trim(),
        category: formData.category || undefined,
        material: formData.material.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        features: formData.featuresText
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
      };

      if (isEdit) {
        await axios.put(`http://localhost:5000/api/products/${id}`, payload, config);
      } else {
        await axios.post('http://localhost:5000/api/products', payload, config);
      }

      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <Link to="/admin/products" className="btn-back">← Back</Link>
        <h1>{isEdit ? 'Edit Product' : 'Create Product'}</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="name">Product Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
                maxLength={100}
              />
            </div>
          </div>
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="material">Material</label>
              <input
                type="text"
                id="material"
                name="material"
                value={formData.material}
                onChange={handleChange}
                placeholder="e.g., Wool, Nylon"
              />
            </div>
          </div>
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="featuresText">Features (comma-separated)</label>
              <input
                type="text"
                id="featuresText"
                name="featuresText"
                value={formData.featuresText}
                onChange={handleChange}
                placeholder="e.g., Stain resistant, Eco-friendly"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows={4}
            maxLength={800}
          />
          <small>{formData.description.length}/800</small>
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleImageChange}
            placeholder="https://example.com/image.jpg"
          />
          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <small>Image Preview</small>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
