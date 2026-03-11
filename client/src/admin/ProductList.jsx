import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './admin.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://carpets-da.onrender.com/api/products');
        setProducts(response.data);
      } catch {
        setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://carpets-da.onrender.com/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage('Product deleted successfully');
      setProducts(prev => prev.filter(product => product._id !== id));
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Manage Products</h1>
        <Link to="/admin/products/new" className="btn-primary">
          + Add Product
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No products yet</p>
          <Link to="/admin/products/new" className="btn-primary">
            Create First Product
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Material</th>
                <th>Features</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td className="name-cell">{product.name}</td>
                  <td>{product.category?.name || '-'}</td>
                  <td>{product.material || '-'}</td>
                  <td>{product.features?.length || 0}</td>
                  <td className="date-cell">
                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="actions-cell">
                    <Link
                      to={`/admin/products/${product._id}`}
                      className="btn-small btn-edit"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id)}
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

export default ProductList;
