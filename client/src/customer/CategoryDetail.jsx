import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './customer.css';

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoryRes, subcategoriesRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/categories/${id}`),
          axios.get('http://localhost:5000/api/subcategories')
        ]);

        setCategory(categoryRes.data);
        // Filter subcategories for this category
        const filtered = subcategoriesRes.data.filter(
          sub => sub.category?._id === id || sub.category === id
        );
        setSubcategories(filtered);
      } catch {
        setError('Failed to load category details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="customer-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="customer-page">
        <div className="container">
          <div className="error-message">{error || 'Category not found'}</div>
          <Link to="/" className="btn-secondary">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-page">
      {/* Category Header */}
      <section className="category-header">
        <div className="container">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Back
          </button>
          <h1>{category.name}</h1>
          {category.description && <p className="category-description">{category.description}</p>}
        </div>
      </section>

      {/* Subcategories Grid */}
      <section className="subcategories-section">
        <div className="container">
          {subcategories.length === 0 ? (
            <div className="empty-message">
              <p>No products available in this category yet.</p>
              <Link to="/" className="btn-primary">Browse Other Categories</Link>
            </div>
          ) : (
            <>
              <div className="section-header">
                <h2>Available Types</h2>
                <p>Choose from our {subcategories.length} varieties</p>
              </div>
              <div className="subcategory-grid">
                {subcategories.map(subcategory => (
                  <Link
                    key={subcategory._id}
                    to={`/subcategory/${subcategory._id}`}
                    className="subcategory-card"
                  >
                    <div className="subcategory-image">
                      {subcategory.image ? (
                        <img src={subcategory.image} alt={subcategory.name} />
                      ) : (
                        <div className="subcategory-placeholder">
                          <span>{subcategory.name[0]}</span>
                        </div>
                      )}
                    </div>
                    <div className="subcategory-info">
                      <h3>{subcategory.name}</h3>
                      {subcategory.description && (
                        <p className="subcategory-desc">{subcategory.description}</p>
                      )}
                      <div className="subcategory-price">
                        <span className="price-label">Starting from</span>
                        <span className="price-value">
                          LKR {subcategory.price ? subcategory.price.toLocaleString() : 'N/A'}
                          <span className="price-unit">/sq ft</span>
                        </span>
                      </div>
                      <span className="view-details">View Details →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Need Help Choosing?</h2>
            <p>Our experts are here to help you find the perfect carpet for your space</p>
            <div className="cta-buttons">
              <a href="tel:+94112345678" className="btn-primary">Call Us Now</a>
              <Link to="/contact" className="btn-secondary">Request a Callback</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoryDetail;
