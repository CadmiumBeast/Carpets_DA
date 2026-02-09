import { useAuth } from '../auth/ProtectedRoute';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <img src="/images/logo.png" alt="Carpets.lk" />
        </div>

        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              <span className="header-user">
                Welcome, {user.fullName || user.username}!
              </span>
              {user.role === 'admin' && (
                <a href="/admin" className="nav-link">Dashboard</a>
              )}
              {user.role === 'customer' && (
                <>
                  <a href="/" className="nav-link">Home</a>
                  <a href="/products" className="nav-link">Products</a>
                  <a href="/orders" className="nav-link">My Orders</a>
                </>
              )}
              <button onClick={logout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <a href="/login" className="nav-link">Login</a>
              <a href="/signup" className="nav-link-primary">Sign Up</a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
