import { Link } from 'react-router-dom';
import './customer.css';

const ContactPage = () => {
  return (
    <div className="customer-page">
      <section className="contact-hero">
        <div className="container">
          <h1>Get in Touch</h1>
          <p>We're here to help you find the perfect carpet for your space</p>
        </div>
      </section>

      {/* Service Links */}
      <section className="service-links-section">
        <div className="container">
          <div className="service-links-grid">
            <Link to="/quotation" className="service-link-card">
              <div className="service-icon">💰</div>
              <h3>Request a Quotation</h3>
              <p>Get an instant estimate for your carpet needs with our advanced calculator</p>
              <span className="link-arrow">Get Started →</span>
            </Link>
            <Link to="/site-visit" className="service-link-card">
              <div className="service-icon">📐</div>
              <h3>Schedule Site Visit</h3>
              <p>Book a professional site visit for accurate measurements and consultation</p>
              <span className="link-arrow">Book Now →</span>
            </Link>
            <Link to="/contact" className="service-link-card">
              <div className="service-icon">📞</div>
              <h3>General Inquiry</h3>
              <p>Have a question? Send us a message and we'll get back to you ASAP</p>
              <span className="link-arrow">Contact Us →</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Contact Information</h2>
              
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div>
                  <h3>Phone</h3>
                  <p><a href="tel:+94112345678">+94 11 234 5678</a></p>
                  <p><a href="tel:+94771234567">+94 77 123 4567</a></p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">📧</div>
                <div>
                  <h3>Email</h3>
                  <p><a href="mailto:info@carpets.lk">info@carpets.lk</a></p>
                  <p><a href="mailto:sales@carpets.lk">sales@carpets.lk</a></p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div>
                  <h3>Showroom Address</h3>
                  <p>123 Galle Road<br />Colombo 03<br />Sri Lanka</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">🕒</div>
                <div>
                  <h3>Business Hours</h3>
                  <p>Monday - Saturday: 9:00 AM - 6:00 PM</p>
                  <p>Sunday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <h2>Send Us a Message</h2>
              <form className="contact-form">
                <div className="form-row">
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="form-row">
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="form-row">
                  <input type="tel" placeholder="Phone Number" required />
                </div>
                <div className="form-row">
                  <select required>
                    <option value="">Select Service</option>
                    <option value="quote">Request Quote</option>
                    <option value="site-visit">Schedule Site Visit</option>
                    <option value="inquiry">General Inquiry</option>
                    <option value="complaint">Complaint</option>
                  </select>
                </div>
                <div className="form-row">
                  <textarea 
                    rows="5" 
                    placeholder="Your Message" 
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary">Send Message</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Transform Your Space?</h2>
            <p>Browse our collection and find the perfect carpet today</p>
            <div className="cta-buttons">
              <Link to="/categories" className="btn-primary">Browse Categories</Link>
              <a href="tel:+94112345678" className="btn-secondary">Call Now</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
