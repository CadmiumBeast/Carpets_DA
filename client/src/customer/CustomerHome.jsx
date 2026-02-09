import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './customer.css';

const CustomerHome = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Carpets.lk</h1>
          <p className="hero-subtitle">
            Sri Lanka's Premier Carpet Store - Quality Carpets for Every Space
          </p>
          <Link to="/categories" className="btn-hero">
            Browse Our Collection
          </Link>
        </div>
        <div className="hero-overlay"></div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <p>Explore our wide range of premium carpet collections</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="empty-message">
              <p>No categories available yet. Please check back soon!</p>
            </div>
          ) : (
            <div className="category-grid">
              {categories.map(category => (
                <Link
                  key={category._id}
                  to={`/category/${category._id}`}
                  className="category-card"
                >
                  <div className="category-image">
                    {category.image ? (
                      <img src={category.image} alt={category.name} />
                    ) : (
                      <div className="category-placeholder">
                        <span>{category.name[0]}</span>
                      </div>
                    )}
                  </div>
                  <div className="category-info">
                    <h3>{category.name}</h3>
                    {category.description && <p>{category.description}</p>}
                    <span className="view-more">View Collection →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Quality Assured</h3>
              <p>Premium quality carpets from trusted manufacturers</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📏</div>
              <h3>Custom Measurements</h3>
              <p>Free site visits and precise measurements</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Professional Installation</h3>
              <p>Expert installation services across Sri Lanka</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Expert Consultation</h3>
              <p>Free consultation to find your perfect carpet</p>
            </div>
          </div>

          {/* Quick Service Cards */}
          <div className="quick-services" style={{ marginTop: '60px' }}>
            <div className="section-header">
              <h2>Our Services</h2>
              <p>Everything you need to find and install your perfect carpet</p>
            </div>
            <div className="service-cards-grid">
              <Link to="/quotation" className="quick-service-card">
                <div className="service-icon">💰</div>
                <h3>Get a Quotation</h3>
                <p>Instant estimate with our advanced calculator</p>
              </Link>
              <Link to="/site-visit" className="quick-service-card">
                <div className="service-icon">📐</div>
                <h3>Schedule Site Visit</h3>
                <p>Book a professional measurement and consultation</p>
              </Link>
              <Link to="/contact" className="quick-service-card">
                <div className="service-icon">📞</div>
                <h3>Contact Us</h3>
                <p>Reach out with any questions or concerns</p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CustomerHome;
