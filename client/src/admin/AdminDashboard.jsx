import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    categories: 0,
    subcategories: 0,
    stock: 0,
    quotations: 0,
    siteVisits: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [categoriesRes, subcategoriesRes, stockRes, quotationsRes, siteVisitsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/categories'),
        axios.get('http://localhost:5000/api/subcategories'),
        axios.get('http://localhost:5000/api/stock'),
        axios.get('http://localhost:5000/api/quotations', config).catch(() => ({ data: [] })),
        axios.get('http://localhost:5000/api/sitevisits', config).catch(() => ({ data: [] }))
      ]);

      setStats({
        categories: categoriesRes.data.length || 0,
        subcategories: subcategoriesRes.data.length || 0,
        stock: stockRes.data.length || 0,
        quotations: quotationsRes.data.length || 0,
        siteVisits: siteVisitsRes.data.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <small className="page-subtitle">Welcome to Carpets.lk Admin Panel</small>
      </div>

      {loading ? (
        <div className="loading">Loading dashboard...</div>
      ) : (
        <>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-icon">📁</div>
              <div className="stat-content">
                <h3>Categories</h3>
                <p className="stat-value">{stats.categories}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📂</div>
              <div className="stat-content">
                <h3>SubCategories</h3>
                <p className="stat-value">{stats.subcategories}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>Stock Items</h3>
                <p className="stat-value">{stats.stock}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Quotations</h3>
                <p className="stat-value">{stats.quotations}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📐</div>
              <div className="stat-content">
                <h3>Site Visits</h3>
                <p className="stat-value">{stats.siteVisits}</p>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="action-buttons">
              <Link to="/admin/categories/new" className="btn-primary">
                + Add Category
              </Link>
              <Link to="/admin/subcategories/new" className="btn-primary">
                + Add SubCategory
              </Link>
              <Link to="/admin/stock/new" className="btn-primary">
                + Add Stock
              </Link>
              <Link to="/admin/quotations" className="btn-secondary">
                View Quotations
              </Link>
              <Link to="/admin/sitevisits" className="btn-secondary">
                View Site Visits
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
