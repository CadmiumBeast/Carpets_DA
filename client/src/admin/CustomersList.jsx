import { useState, useEffect } from 'react';
import axios from 'axios';
import './admin.css';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const params = filter !== 'all' ? `?status=${filter}` : '';
        const response = await axios.get(`https://carpets-da.onrender.com/api/customers${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }));
        setCustomers(response.data);
      } catch {
        setError('Failed to fetch customers');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [filter]);

  const getStatusClass = (status) => {
    const statusMap = {
      'Inquiry': 'status-inquiry',
      'Quoted': 'status-quoted',
      'Job Done': 'status-done',
      'Active': 'status-active'
    };
    return statusMap[status] || '';
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Customers Management</h1>
        <div className="filter-group">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Customers</option>
            <option value="Inquiry">Inquiry</option>
            <option value="Quoted">Quoted</option>
            <option value="Active">Active</option>
            <option value="Job Done">Job Done</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <p>No customers found</p>
          <p className="text-muted">Customer information from quotations and site visits will appear here</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer._id}>
                  <td className="name-cell">{customer.fullName}</td>
                  <td>{customer.email || '-'}</td>
                  <td>
                    {customer.phone ? (
                      <a href={`tel:${customer.phone}`} className="phone-link">
                        {customer.phone}
                      </a>
                    ) : '-'}
                  </td>
                  <td>{customer.city || '-'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(customer.status)}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>{customer.assignedTo?.fullName || '-'}</td>
                  <td className="date-cell">
                    {new Date(customer.createdAt).toLocaleDateString()}
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

export default CustomersList;
