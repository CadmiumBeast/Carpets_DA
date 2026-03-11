import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './admin.css';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://carpets-da.onrender.com/api/categories');
      setCategories(response.data);
    } catch {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://carpets-da.onrender.com/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Category deleted successfully');
      fetchCategories();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Manage Categories</h1>
        <Link to="/admin/categories/new" className="btn-primary">
          + Add Category
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {loading ? (
        <div className="loading">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <p>No categories yet</p>
          <Link to="/admin/categories/new" className="btn-primary">
            Create First Category
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Image</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category._id}>
                  <td className="name-cell">{category.name}</td>
                  <td>{category.description || '-'}</td>
                  <td>
                    {category.image ? (
                      <img src={category.image} alt={category.name} className="thumb" />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="date-cell">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </td>
                  <td className="actions-cell">
                    <Link
                      to={`/admin/categories/${category._id}`}
                      className="btn-small btn-edit"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(category._id)}
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

export default CategoryList;
