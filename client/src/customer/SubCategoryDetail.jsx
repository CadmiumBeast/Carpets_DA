import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './customer.css';

const SubCategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subcategory, setSubcategory] = useState(null);
  const [stock, setStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedColour, setSelectedColour] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('Available');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [subcategoryRes, stockRes] = await Promise.all([
          axios.get(`https://carpets-da.onrender.com/api/subcategories/${id}`),
          axios.get('https://carpets-da.onrender.com/api/stock')
        ]);

        setSubcategory(subcategoryRes.data);
        // Filter stock for this subcategory
        const filtered = stockRes.data.filter(
          item => item.subCategoryId?._id === id || item.subCategoryId === id
        );
        setStock(filtered);
      } catch {
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    let filtered = stock;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    if (selectedColour !== 'all') {
      filtered = filtered.filter(item => 
        item.colour?.toLowerCase() === selectedColour.toLowerCase()
      );
    }

    setFilteredStock(filtered);
  }, [stock, selectedColour, selectedStatus]);

  const getUniqueColours = () => {
    const colours = stock
      .map(item => item.colour)
      .filter(Boolean)
      .filter((value, index, self) => self.indexOf(value) === index);
    return colours;
  };

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

  if (error || !subcategory) {
    return (
      <div className="customer-page">
        <div className="container">
          <div className="error-message">{error || 'Product not found'}</div>
          <button onClick={() => navigate(-1)} className="btn-secondary">← Go Back</button>
        </div>
      </div>
    );
  }

  const availableStock = stock.filter(item => item.status === 'Available').length;

  return (
    <div className="customer-page">
      {/* Product Header */}
      <section className="product-header">
        <div className="container">
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Back to {subcategory.category?.name || 'Categories'}
          </button>

          <div className="product-hero">
            <div className="product-image-large">
              {subcategory.image ? (
                <img src={subcategory.image} alt={subcategory.name} />
              ) : (
                <div className="product-placeholder-large">
                  <span>{subcategory.name[0]}</span>
                </div>
              )}
            </div>

            <div className="product-details">
              <div className="breadcrumb">
                <Link to="/">Home</Link> / 
                <Link to={`/category/${subcategory.category?._id}`}>
                  {subcategory.category?.name}
                </Link> / 
                <span>{subcategory.name}</span>
              </div>

              <h1>{subcategory.name}</h1>
              
              {subcategory.description && (
                <p className="product-description">{subcategory.description}</p>
              )}

              <div className="product-price-box">
                <div className="price-main">
                  <span className="price-label">Price per sq ft</span>
                  <span className="price-amount">
                    LKR {subcategory.price ? subcategory.price.toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="stock-availability">
                  <span className={`stock-badge ${availableStock > 0 ? 'in-stock' : 'out-stock'}`}>
                    {availableStock > 0 ? `${availableStock} rolls available` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div className="action-buttons">
                <Link to="/quotation" className="btn-primary">Request Quote</Link>
                <a href="tel:+94112345678" className="btn-secondary">Call Us</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Available Stock Section */}
      {stock.length > 0 && (
        <section className="stock-section">
          <div className="container">
            <div className="section-header">
              <h2>Available Stock</h2>
              <p>Currently we have {filteredStock.length} items matching your selection</p>
            </div>

            {/* Filters */}
            <div className="stock-filters">
              <div className="filter-group">
                <label>Colour:</label>
                <select 
                  value={selectedColour} 
                  onChange={(e) => setSelectedColour(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Colours</option>
                  {getUniqueColours().map(colour => (
                    <option key={colour} value={colour}>{colour}</option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Status:</label>
                <select 
                  value={selectedStatus} 
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="Available">Available</option>
                  <option value="all">All Status</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </div>
            </div>

            {/* Stock Grid */}
            {filteredStock.length === 0 ? (
              <div className="empty-message">
                <p>No stock items match your filters</p>
              </div>
            ) : (
              <div className="stock-grid">
                {filteredStock.map(item => (
                  <div key={item._id} className="stock-card">
                    <div className="stock-header">
                      <span className="roll-number">Roll #{item.rollNumber || 'N/A'}</span>
                      <span className={`status-badge status-${item.status?.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="stock-details">
                      {item.dimensions && (
                        <div className="stock-info-row">
                          <span className="info-label">Dimensions:</span>
                          <span className="info-value">
                            {item.dimensions.width} ft × {item.dimensions.length} ft
                          </span>
                        </div>
                      )}

                      {item.colour && (
                        <div className="stock-info-row">
                          <span className="info-label">Colour:</span>
                          <span className="info-value">{item.colour}</span>
                        </div>
                      )}

                      {item.location && (
                        <div className="stock-info-row">
                          <span className="info-label">Location:</span>
                          <span className="info-value">{item.location}</span>
                        </div>
                      )}
                    </div>

                    {item.status === 'Available' && (
                      <Link to="/quotation" className="btn-stock">
                        Inquire Now
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Info Section */}
      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <h3>🎯 Need Help Measuring?</h3>
              <p>Our experts can visit your location for accurate measurements</p>
              <Link to="/site-visit" className="info-link">Schedule Site Visit →</Link>
            </div>
            <div className="info-card">
              <h3>💰 Get a Quote</h3>
              <p>Receive a detailed quotation including installation</p>
              <Link to="/quotation" className="info-link">Request Quote →</Link>
            </div>
            <div className="info-card">
              <h3>⚡ Professional Installation</h3>
              <p>Expert installation services available island-wide</p>
              <Link to="/contact" className="info-link">Learn More →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubCategoryDetail;
