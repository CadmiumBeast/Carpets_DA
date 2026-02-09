import { useState, useEffect } from 'react';
import axios from 'axios';
import './admin.css';

const SiteVisitsList = () => {
  const [siteVisits, setSiteVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchSiteVisits = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const params = filter !== 'all' ? `?status=${filter}` : '';
        const response = await axios.get(`http://localhost:5000/api/sitevisits${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSiteVisits(response.data);
      } catch {
        setError('Failed to fetch site visits');
      } finally {
        setLoading(false);
      }
    };

    fetchSiteVisits();
  }, [filter]);

  const getStatusClass = (status) => {
    const statusMap = {
      'Scheduled': 'status-scheduled',
      'Completed': 'status-completed',
      'Cancelled': 'status-cancelled'
    };
    return statusMap[status] || '';
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/sitevisits/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refetch site visits after status change
      setLoading(true);
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await axios.get(`http://localhost:5000/api/sitevisits${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSiteVisits(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Site Visits Management</h1>
        <div className="filter-group">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Visits</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading site visits...</div>
      ) : siteVisits.length === 0 ? (
        <div className="empty-state">
          <p>No site visits found</p>
          <p className="text-muted">Customer site visit bookings will appear here</p>
        </div>
      ) : (
        <div className="sitevisits-grid">
          {siteVisits.map(visit => (
            <div key={visit._id} className="sitevisit-card">
              <div className="sitevisit-header">
                <div>
                  <h3>{visit.customer?.fullName || 'Unknown Customer'}</h3>
                  <p className="visit-date">{formatDateTime(visit.scheduledDate)}</p>
                </div>
                <span className={`status-badge ${getStatusClass(visit.status)}`}>
                  {visit.status}
                </span>
              </div>

              <div className="sitevisit-body">
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">{visit.customer?.phone || '-'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Address:</span>
                  <span className="value">{visit.customer?.address || '-'}</span>
                </div>
                {visit.measurements?.totalSqFt && (
                  <div className="info-row">
                    <span className="label">Area:</span>
                    <span className="value">{visit.measurements.totalSqFt} sq ft</span>
                  </div>
                )}
                {visit.measurements?.dimensions && (
                  <div className="info-row">
                    <span className="label">Dimensions:</span>
                    <span className="value">
                      {visit.measurements.dimensions.length} × {visit.measurements.dimensions.width} ft
                    </span>
                  </div>
                )}
                {visit.installer?.fullName && (
                  <div className="info-row">
                    <span className="label">Installer:</span>
                    <span className="value">{visit.installer.fullName}</span>
                  </div>
                )}
                {visit.siteNotes && (
                  <div className="info-row">
                    <span className="label">Notes:</span>
                    <span className="value notes">{visit.siteNotes}</span>
                  </div>
                )}
              </div>

              <div className="sitevisit-actions">
                <select
                  value={visit.status}
                  onChange={(e) => handleStatusChange(visit._id, e.target.value)}
                  className="status-select"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <a 
                  href={`tel:${visit.customer?.phone}`}
                  className="btn-small btn-call"
                  disabled={!visit.customer?.phone}
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

export default SiteVisitsList;
