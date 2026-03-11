import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './admin.css';

const SubCategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    image: '',
    description: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesRes, subcategoryRes] = await Promise.all([
          axios.get('https://carpets-da.onrender.com/api/categories'),
          isEdit ? axios.get(`https://carpets-da.onrender.com/api/subcategories/${id}`) : Promise.resolve(null)
        ]);

        setCategories(categoriesRes.data);

        if (isEdit && subcategoryRes) {
          const subcategory = subcategoryRes.data;
          setFormData({
            name: subcategory.name || '',
            category: subcategory.category?._id || '',
            price: subcategory.price?.toString() || '',
            image: subcategory.image || '',
            description: subcategory.description || ''
          });
          setImagePreview(subcategory.image || '');
        }
      } catch {
        setError('Failed to load data');
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
      setError('SubCategory name is required');
      setLoading(false);
      return;
    }

    if (!formData.category) {
      setError('Category is required');
      setLoading(false);
      return;
    }

    if (!formData.price || Number(formData.price) <= 0) {
      setError('Valid price is required');
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
        category: formData.category,
        price: Number(formData.price),
        image: formData.image.trim(),
        description: formData.description.trim()
      };

      if (isEdit) {
        await axios.put(`https://carpets-da.onrender.com/api/subcategories/${id}`, payload, config);
      } else {
        await axios.post('https://carpets-da.onrender.com/api/subcategories', payload, config);
      }

      navigate('/admin/subcategories');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subcategory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <Link to="/admin/subcategories" className="btn-back">← Back</Link>
        <h1>{isEdit ? 'Edit SubCategory' : 'Create SubCategory'}</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="name">SubCategory Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Loop Pile, Cut Pile, Tile"
                required
                maxLength={100}
              />
            </div>
          </div>
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
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
              <label htmlFor="price">Price (LKR) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="form-col">
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
            </div>
          </div>
        </div>

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <small>Image Preview</small>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description"
            rows={4}
            maxLength={500}
          />
          <small>{formData.description.length}/500</small>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/subcategories')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update SubCategory' : 'Create SubCategory')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubCategoryForm;
