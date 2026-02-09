import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './admin.css';

const StockForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [subcategories, setSubcategories] = useState([]);
  const [formData, setFormData] = useState({
    subCategoryId: '',
    rollNumber: '',
    width: '',
    length: '',
    colour: '',
    location: '',
    status: 'Available'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [subcategoriesRes, stockRes] = await Promise.all([
          axios.get('http://localhost:5000/api/subcategories'),
          isEdit ? axios.get(`http://localhost:5000/api/stock/${id}`) : Promise.resolve(null)
        ]);

        setSubcategories(subcategoriesRes.data);

        if (isEdit && stockRes) {
          const stock = stockRes.data;
          setFormData({
            subCategoryId: stock.subCategoryId?._id || '',
            rollNumber: stock.rollNumber || '',
            width: stock.dimensions?.width?.toString() || '',
            length: stock.dimensions?.length?.toString() || '',
            colour: stock.colour || '',
            location: stock.location || '',
            status: stock.status || 'Available'
          });
        }
      } catch {
        setError('Failed to load stock data');
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



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.subCategoryId) {
      setError('SubCategory is required');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const payload = {
        subCategoryId: formData.subCategoryId,
        rollNumber: formData.rollNumber.trim(),
        dimensions: {
          width: formData.width ? Number(formData.width) : undefined,
          length: formData.length ? Number(formData.length) : undefined
        },
        colour: formData.colour.trim(),
        location: formData.location.trim(),
        status: formData.status
      };

      if (isEdit) {
        await axios.put(`http://localhost:5000/api/stock/${id}`, payload, config);
      } else {
        await axios.post('http://localhost:5000/api/stock', payload, config);
      }

      navigate('/admin/stock');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save stock item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <Link to="/admin/stock" className="btn-back">← Back</Link>
        <h1>{isEdit ? 'Edit Stock Item' : 'Create Stock Item'}</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="subCategoryId">SubCategory *</label>
              <select
                id="subCategoryId"
                name="subCategoryId"
                value={formData.subCategoryId}
                onChange={handleChange}
                required
              >
                <option value="">Select subcategory</option>
                {subcategories.map(subcategory => (
                  <option key={subcategory._id} value={subcategory._id}>
                    {subcategory.name} ({subcategory.category?.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="rollNumber">Roll Number</label>
              <input
                type="text"
                id="rollNumber"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                placeholder="e.g., ROLL-001"
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="width">Width (ft)</label>
              <input
                type="number"
                id="width"
                name="width"
                value={formData.width}
                onChange={handleChange}
                placeholder="Width"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="length">Length (ft)</label>
              <input
                type="number"
                id="length"
                name="length"
                value={formData.length}
                onChange={handleChange}
                placeholder="Length"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="colour">Colour</label>
              <input
                type="text"
                id="colour"
                name="colour"
                value={formData.colour}
                onChange={handleChange}
                placeholder="e.g., Beige, Grey, Brown"
              />
            </div>
          </div>
          <div className="form-col">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Warehouse A - Shelf 3"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/admin/stock')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (isEdit ? 'Update Stock' : 'Create Stock')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StockForm;
