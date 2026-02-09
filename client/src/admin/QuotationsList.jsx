import { useState, useEffect } from 'react';
import axios from 'axios';
import './admin.css';

const QuotationsList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const params = filter !== 'all' ? `?status=${filter}` : '';
        const response = await axios.get(`http://localhost:5000/api/quotations${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuotations(response.data);
      } catch {
        setError('Failed to fetch quotations');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, [filter]);

  const getStatusClass = (status) => {
    const statusMap = {
      'Draft': 'status-draft',
      'Sent': 'status-sent',
      'Accepted': 'status-accepted',
      'Rejected': 'status-rejected',
      'Expired': 'status-expired'
    };
    return statusMap[status] || '';
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/quotations/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refetch quotations after status change
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await axios.get(`http://localhost:5000/api/quotations${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuotations(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Quotations Management</h1>
        <div className="filter-group">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Quotations</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading quotations...</div>
      ) : quotations.length === 0 ? (
        <div className="empty-state">
          <p>No quotations found</p>
          <p className="text-muted">Customer quotation requests will appear here</p>
        </div>
      ) : (
        <div className="quotations-grid">
          {quotations.map(quotation => (
            <div key={quotation._id} className="quotation-card">
              <div className="quotation-header">
                <div>
                  <h3>{quotation.quotationNumber}</h3>
                  <p className="customer-name">{quotation.customer?.fullName || 'Unknown'}</p>
                </div>
                <span className={`status-badge ${getStatusClass(quotation.status)}`}>
                  {quotation.status}
                </span>
              </div>

              <div className="quotation-body">
                <div className="info-row">
                  <span className="label">Customer:</span>
                  <span className="value">{quotation.customer?.fullName}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{quotation.customer?.email || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">{quotation.customer?.phone || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Total Amount:</span>
                  <span className="value amount">LKR {quotation.totalAmount?.toLocaleString() || '0'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Items:</span>
                  <span className="value">{quotation.itemCount || 0} item(s)</span>
                </div>
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">{new Date(quotation.quotationDate || quotation.createdAt).toLocaleDateString()}</span>
                </div>
                {quotation.assignedUser?.fullName && (
                  <div className="info-row">
                    <span className="label">Assigned:</span>
                    <span className="value">{quotation.assignedUser.fullName}</span>
                  </div>
                )}
              </div>

              <div className="quotation-actions">
                <select
                  value={quotation.status}
                  onChange={(e) => handleStatusChange(quotation._id, e.target.value)}
                  className="status-select"
                >
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
                <a 
                  href={`tel:${quotation.customer?.phone}`}
                  className="btn-small btn-call"
                  disabled={!quotation.customer?.phone}
                >
                  📞 Call
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuotationsList;
