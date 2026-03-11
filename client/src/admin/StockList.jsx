import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './admin.css';

const StockList = () => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://carpets-da.onrender.com/api/stock');
        setStockItems(response.data);
      } catch {
        setError('Failed to fetch stock items');
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock item?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://carpets-da.onrender.com/api/stock/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Stock item deleted successfully');
      setStockItems(prev => prev.filter(item => item._id !== id));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete stock item');
    }
  };

  const getStatusClass = (status) => {
    if (status === 'Available') return 'status-available';
    if (status === 'Reserved') return 'status-reserved';
    if (status === 'Sold') return 'status-sold';
    return '';
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Manage Stock</h1>
        <Link to="/admin/stock/new" className="btn-primary">
          + Add Stock
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {loading ? (
        <div className="loading">Loading stock items...</div>
      ) : stockItems.length === 0 ? (
        <div className="empty-state">
          <p>No stock items yet</p>
          <Link to="/admin/stock/new" className="btn-primary">
            Create First Stock Item
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>SubCategory</th>
                <th>Roll No.</th>
                <th>Dimensions</th>
                <th>Colour</th>
                <th>Status</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map(item => (
                <tr key={item._id}>
                  <td className="name-cell">{item.subCategoryId?.name || '-'}</td>
                  <td>{item.rollNumber || '-'}</td>
                  <td>
                    {(item.dimensions?.width || '-')}
                    {' x '}
                    {(item.dimensions?.length || '-')}
                  </td>
                  <td>{item.colour || '-'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.location || '-'}</td>
                  <td className="actions-cell">
                    <Link
                      to={`/admin/stock/${item._id}`}
                      className="btn-small btn-edit"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item._id)}
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

export default StockList;
