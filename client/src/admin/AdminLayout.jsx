import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import './admin.css';

const AdminLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <div className="logo-section">
            <h3>🏢 Admin Panel</h3>
            <span className="brand-name">Carpets.lk</span>
          </div>
          <div className="user-badge">
            <span className="user-icon">👤</span>
            <span className="user-name">{user?.fullName || user?.username}</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>

        <nav className="admin-nav">
          <Link
            to="/admin"
            className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            🏠 Dashboard
          </Link>

          <div className="nav-section">
            <div className="nav-section-title">Catalog</div>
            <Link
              to="/admin/categories"
              className={`nav-item ${isActive('/admin/categories') ? 'active' : ''}`}
            >
              📁 Categories
            </Link>
            <Link
              to="/admin/subcategories"
              className={`nav-item ${isActive('/admin/subcategories') ? 'active' : ''}`}
            >
              📂 SubCategories
            </Link>
            <Link
              to="/admin/stock"
              className={`nav-item ${isActive('/admin/stock') ? 'active' : ''}`}
            >
              📦 Stock Inventory
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">Business</div>
            <Link
              to="/admin/quotations"
              className={`nav-item ${isActive('/admin/quotations') ? 'active' : ''}`}
            >
              💰 Quotations
            </Link>
            <Link
              to="/admin/sitevisits"
              className={`nav-item ${isActive('/admin/sitevisits') ? 'active' : ''}`}
            >
              📐 Site Visits
            </Link>
            <Link
              to="/admin/customers"
              className={`nav-item ${isActive('/admin/customers') ? 'active' : ''}`}
            >
              👥 Customers
            </Link>
          </div>

          <div className="nav-section">
            <div className="nav-section-title">System</div>
            <Link
              to="/admin/settings"
              className={`nav-item ${isActive('/admin/settings') ? 'active' : ''}`}
            >
              Settings
            </Link>
          </div>
        </nav>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
