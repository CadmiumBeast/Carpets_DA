import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './customer.css';

const QuotationGenerator = () => {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    subCategoryId: '',
    roomLength: '',
    roomWidth: '',
    installationRequired: false,
    sealing: false,
    pattern: 'simple',
    obstaclePercentage: '0',
    notes: ''
  });

  const [calculation, setCalculation] = useState(null);

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const response = await axios.get('https://carpets-da.onrender.com/api/subcategories');
      setSubcategories(response.data);
    } catch {
      setError('Failed to load subcategories');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const calculateQuotation = () => {
    if (!formData.subCategoryId || !formData.roomLength || !formData.roomWidth) {
      setError('Please fill in all required fields');
      return;
    }

    const subcategory = subcategories.find(s => s._id === formData.subCategoryId);
    if (!subcategory) {
      setError('Invalid subcategory selected');
      return;
    }

    const length = parseFloat(formData.roomLength);
    const width = parseFloat(formData.roomWidth);
    const baseArea = length * width;

    // Calculate waste percentage
    let wastePercentage = 5; // Base 5%
    
    if (formData.pattern === 'pattern') wastePercentage += 5;
    if (formData.sealing) wastePercentage += 3;
    wastePercentage += parseInt(formData.obstaclePercentage);
    wastePercentage = Math.min(wastePercentage, 35); // Max 35%

    const wasteArea = (baseArea * wastePercentage) / 100;
    const totalArea = baseArea + wasteArea;

    // Calculate costs
    const materialCost = totalArea * subcategory.price;
    const installationCost = formData.installationRequired 
      ? totalArea * (200 + (totalArea > 50 ? 50 : 0)) // Base 200 + complexity
      : 0;
    const tax = (materialCost + installationCost) * 0.1; // 10% tax

    const total = materialCost + installationCost + tax;

    setCalculation({
      baseArea: baseArea.toFixed(2),
      wastePercentage: wastePercentage.toFixed(2),
      wasteArea: wasteArea.toFixed(2),
      totalArea: totalArea.toFixed(2),
      materialCost: materialCost.toFixed(2),
      installationCost: installationCost.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      subcategoryName: subcategory.name,
      pricePerSqFt: subcategory.price
    });

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!calculation) {
      calculateQuotation();
      return;
    }

    try {
      setSubmitting(true);

      const quotationData = {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        subCategoryId: formData.subCategoryId,
        roomLength: formData.roomLength,
        roomWidth: formData.roomWidth,
        pattern: formData.pattern,
        sealing: formData.sealing,
        obstaclePercentage: formData.obstaclePercentage,
        installationRequired: formData.installationRequired,
        notes: formData.notes
      };

      const response = await axios.post(
        'https://carpets-da.onrender.com/api/quotations/request',
        quotationData
      );

      setSuccess(`Quotation created successfully! Reference: ${response.data.quotationNumber}`);
      setError('');
      
      // Reset form after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit quotation');
      setSuccess('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="customer-page">
      <section className="quotation-hero">
        <div className="container">
          <h1>Generate Quotation</h1>
          <p>Get an instant estimate for your carpet requirements</p>
        </div>
      </section>

      <section className="quotation-section">
        <div className="container">
          <div className="quotation-container">
            {/* Form Section */}
            <div className="quotation-form-box">
              <h2>Your Details & Requirements</h2>
              
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <form onSubmit={handleSubmit} className="quotation-form">
                {/* Customer Info */}
                <fieldset className="form-section">
                  <legend>Contact Information</legend>
                  
                  <div className="form-row">
                    <input
                      type="text"
                      name="customerName"
                      placeholder="Full Name *"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </fieldset>

                {/* Product Selection */}
                <fieldset className="form-section">
                  <legend>Select Carpet Type</legend>
                  
                  <div className="form-row">
                    <select
                      name="subCategoryId"
                      value={formData.subCategoryId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Choose a carpet type *</option>
                      {subcategories.map(sub => (
                        <option key={sub._id} value={sub._id}>
                          {sub.name} - LKR {sub.price.toLocaleString()}/sq ft
                        </option>
                      ))}
                    </select>
                  </div>
                </fieldset>

                {/* Room Dimensions */}
                <fieldset className="form-section">
                  <legend>Room Dimensions</legend>
                  
                  <div className="form-row form-row-half">
                    <div>
                      <label>Room Length (feet) *</label>
                      <input
                        type="number"
                        name="roomLength"
                        placeholder="e.g., 20"
                        value={formData.roomLength}
                        onChange={handleInputChange}
                        step="0.1"
                        required
                      />
                    </div>
                    <div>
                      <label>Room Width (feet) *</label>
                      <input
                        type="number"
                        name="roomWidth"
                        placeholder="e.g., 15"
                        value={formData.roomWidth}
                        onChange={handleInputChange}
                        step="0.1"
                        required
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Carpet Specifications */}
                <fieldset className="form-section">
                  <legend>Carpet Specifications</legend>
                  
                  <div className="form-row">
                    <label>Pattern Type:</label>
                    <select
                      name="pattern"
                      value={formData.pattern}
                      onChange={handleInputChange}
                    >
                      <option value="simple">Simple Pattern</option>
                      <option value="pattern">Complex Pattern</option>
                    </select>
                  </div>

                  <div className="form-row form-row-half">
                    <div>
                      <label>Obstacle %:</label>
                      <input
                        type="number"
                        name="obstaclePercentage"
                        placeholder="0-25"
                        value={formData.obstaclePercentage}
                        onChange={handleInputChange}
                        min="0"
                        max="25"
                      />
                    </div>
                    <div className="checkbox-wrapper">
                      <label>
                        <input
                          type="checkbox"
                          name="sealing"
                          checked={formData.sealing}
                          onChange={handleInputChange}
                        />
                        Sealing Required
                      </label>
                    </div>
                  </div>

                  <div className="checkbox-wrapper">
                    <label>
                      <input
                        type="checkbox"
                        name="installationRequired"
                        checked={formData.installationRequired}
                        onChange={handleInputChange}
                      />
                      Include Installation Service
                    </label>
                  </div>
                </fieldset>

                {/* Notes */}
                <fieldset className="form-section">
                  <legend>Additional Notes</legend>
                  
                  <div className="form-row">
                    <textarea
                      name="notes"
                      placeholder="Any special requirements or preferences..."
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                </fieldset>

                {/* Action Buttons */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={calculateQuotation}
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Calculate Estimate
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting || !calculation}
                  >
                    {submitting ? 'Submitting...' : 'Submit Quotation'}
                  </button>
                </div>
              </form>
            </div>

            {/* Calculation Summary */}
            {calculation && (
              <div className="quotation-summary-box">
                <h2>Quotation Summary</h2>
                
                <div className="summary-card">
                  <div className="summary-section">
                    <h3>Room & Material Calculation</h3>
                    <div className="summary-row">
                      <span>Base Room Area:</span>
                      <strong>{calculation.baseArea} sq ft</strong>
                    </div>
                    <div className="summary-row">
                      <span>Waste Percentage:</span>
                      <strong>{calculation.wastePercentage}%</strong>
                    </div>
                    <div className="summary-row">
                      <span>Waste Area:</span>
                      <strong>{calculation.wasteArea} sq ft</strong>
                    </div>
                    <div className="summary-row highlight">
                      <span>Total Material Needed:</span>
                      <strong>{calculation.totalArea} sq ft</strong>
                    </div>
                  </div>

                  <div className="summary-section">
                    <h3>Cost Breakdown</h3>
                    <div className="summary-row">
                      <span>Carpet Type:</span>
                      <strong>{calculation.subcategoryName}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Price per sq ft:</span>
                      <strong>LKR {calculation.pricePerSqFt.toLocaleString()}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Material Cost:</span>
                      <strong>LKR {parseFloat(calculation.materialCost).toLocaleString()}</strong>
                    </div>
                    {formData.installationRequired && (
                      <div className="summary-row">
                        <span>Installation Cost:</span>
                        <strong>LKR {parseFloat(calculation.installationCost).toLocaleString()}</strong>
                      </div>
                    )}
                    <div className="summary-row">
                      <span>Tax (10%):</span>
                      <strong>LKR {parseFloat(calculation.tax).toLocaleString()}</strong>
                    </div>
                    <div className="summary-row total">
                      <span>Total Estimate:</span>
                      <strong>LKR {parseFloat(calculation.total).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="summary-note">
                    <p>💡 <strong>Note:</strong> This is an estimate based on the dimensions you provided. The final quotation may vary based on actual site measurements and specific requirements.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default QuotationGenerator;
