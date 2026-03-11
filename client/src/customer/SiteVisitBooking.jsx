import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './customer.css';

const SiteVisitBooking = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    preferredDate: '',
    preferredTime: '09:00',
    roomLength: '',
    roomWidth: '',
    roomType: 'living-room',
    specialRequirements: '',
    agreeTerms: false
  });

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const roomTypes = [
    { value: 'living-room', label: 'Living Room' },
    { value: 'bedroom', label: 'Bedroom' },
    { value: 'office', label: 'Office' },
    { value: 'commercial', label: 'Commercial Space' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.customerName || !formData.email || !formData.phone) {
      setError('Please fill in all contact information');
      return false;
    }
    if (!formData.address || !formData.city) {
      setError('Please fill in your complete address');
      return false;
    }
    if (!formData.preferredDate) {
      setError('Please select a preferred date');
      return false;
    }
    if (!formData.agreeTerms) {
      setError('Please agree to the terms and conditions');
      return false;
    }

    // Check if date is in the future
    const selectedDate = new Date(formData.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setError('Please select a future date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}${formData.postalCode ? ', ' + formData.postalCode : ''}`,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        roomLength: formData.roomLength || null,
        roomWidth: formData.roomWidth || null,
        roomType: formData.roomType,
        notes: formData.specialRequirements
      };

      const response = await axios.post(
        'https://carpets-da.onrender.com/api/sitevisits/request',
        bookingData
      );

      setSuccess(`Site visit scheduled successfully! Our team will contact you to confirm. Reference: ${response.data.siteVisit._id}`);
      setError('');
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule site visit');
      setSuccess('');
    } finally {
      setSubmitting(false);
    }
  };

  // Get minimum date (today + 1 day)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="customer-page">
      <section className="site-visit-hero">
        <div className="container">
          <h1>Schedule a Site Visit</h1>
          <p>Our experts will visit your location for accurate measurements and personalized recommendations</p>
        </div>
      </section>

      <section className="site-visit-section">
        <div className="container">
          <div className="site-visit-container">
            {/* Benefits */}
            <div className="site-visit-benefits">
              <h2>Why Schedule a Site Visit?</h2>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-icon">📐</div>
                  <h3>Accurate Measurements</h3>
                  <p>Professional team takes precise measurements of your space</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">🎨</div>
                  <h3>Design Consultation</h3>
                  <p>Get expert advice on colors, patterns, and styles</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">💰</div>
                  <h3>Accurate Quotation</h3>
                  <p>Receive precise pricing based on actual site conditions</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">⚡</div>
                  <h3>Quick Installation</h3>
                  <p>Fast and professional installation by our trained team</p>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="site-visit-form-box">
              <h2>Booking Details</h2>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <form onSubmit={handleSubmit} className="site-visit-form">
                
                {/* Contact Information */}
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

                  <div className="form-row form-row-half">
                    <div>
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address *"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number *"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Location Information */}
                <fieldset className="form-section">
                  <legend>Location Details</legend>

                  <div className="form-row">
                    <input
                      type="text"
                      name="address"
                      placeholder="Street Address *"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-row form-row-half">
                    <div>
                      <input
                        type="text"
                        name="city"
                        placeholder="City *"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="postalCode"
                        placeholder="Postal Code"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Room Information */}
                <fieldset className="form-section">
                  <legend>Room Information</legend>

                  <div className="form-row">
                    <label>Room Type *</label>
                    <select
                      name="roomType"
                      value={formData.roomType}
                      onChange={handleInputChange}
                      required
                    >
                      {roomTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row form-row-half">
                    <div>
                      <label>Room Length (feet) - Optional</label>
                      <input
                        type="number"
                        name="roomLength"
                        placeholder="e.g., 20"
                        value={formData.roomLength}
                        onChange={handleInputChange}
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label>Room Width (feet) - Optional</label>
                      <input
                        type="number"
                        name="roomWidth"
                        placeholder="e.g., 15"
                        value={formData.roomWidth}
                        onChange={handleInputChange}
                        step="0.1"
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Visit Scheduling */}
                <fieldset className="form-section">
                  <legend>Preferred Visit Time</legend>

                  <div className="form-row form-row-half">
                    <div>
                      <label>Preferred Date *</label>
                      <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleInputChange}
                        min={minDate}
                        required
                      />
                    </div>
                    <div>
                      <label>Preferred Time *</label>
                      <select
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleInputChange}
                        required
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time}>
                            {time} (AM/PM)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </fieldset>

                {/* Special Requirements */}
                <fieldset className="form-section">
                  <legend>Special Requirements</legend>

                  <div className="form-row">
                    <textarea
                      name="specialRequirements"
                      placeholder="Any special requests or notes for our team..."
                      value={formData.specialRequirements}
                      onChange={handleInputChange}
                      rows="3"
                    ></textarea>
                  </div>
                </fieldset>

                {/* Terms & Conditions */}
                <div className="form-section">
                  <div className="checkbox-wrapper">
                    <label>
                      <input
                        type="checkbox"
                        name="agreeTerms"
                        checked={formData.agreeTerms}
                        onChange={handleInputChange}
                        required
                      />
                      I agree that Carpets.lk can contact me to confirm the site visit and provide additional information
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Booking Site Visit...' : 'Schedule Site Visit'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-card">
              <h3>⏱️ How Long Does It Take?</h3>
              <p>Typical site visits take 30-45 minutes depending on the room size and complexity</p>
            </div>
            <div className="info-card">
              <h3>🚗 Is There Delivery Charge?</h3>
              <p>No additional charge for site visits within Colombo area</p>
            </div>
            <div className="info-card">
              <h3>📞 Need to Reschedule?</h3>
              <p>Contact us at +94 11 234 5678 to reschedule your appointment</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SiteVisitBooking;
