import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './admin.css';

const SubCategoryList = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/subcategories');
      setSubcategories(response.data);
    } catch {
      setError('Failed to fetch subcategories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/subcategories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('SubCategory deleted successfully');
      fetchSubcategories();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete subcategory');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Manage SubCategories</h1>
        <Link to="/admin/subcategories/new" className="btn-primary">
          + Add SubCategory
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {loading ? (
        <div className="loading">Loading subcategories...</div>
      ) : subcategories.length === 0 ? (
        <div className="empty-state">
          <p>No subcategories yet</p>
          <Link to="/admin/subcategories/new" className="btn-primary">
            Create First SubCategory
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price (LKR)</th>
                <th>Image</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subcategories.map(subcategory => (
                <tr key={subcategory._id}>
                  <td className="name-cell">{subcategory.name}</td>
                  <td>{subcategory.category?.name || '-'}</td>
                  <td>{subcategory.price ? `LKR ${subcategory.price.toFixed(2)}` : '-'}</td>
                  <td>
                    {subcategory.image ? (
                      <img src={subcategory.image} alt={subcategory.name} className="thumb" />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="date-cell">
                    {new Date(subcategory.createdAt).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    <Link
                      to={`/admin/subcategories/${subcategory._id}`}
                      className="btn-small btn-edit"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(subcategory._id)}
                      className="btn-small btn-delete"
                    >
                      Delete
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
};

export default SubCategoryList;
