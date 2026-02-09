import './admin.css';

const ComingSoon = ({ title }) => {
  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>{title}</h1>
      </div>
      <div className="empty-state">
        <p>🚀 Coming Soon</p>
        <p style={{ fontSize: '14px', marginTop: '12px' }}>This feature is under development.</p>
      </div>
    </div>
  );
};

export default ComingSoon;
