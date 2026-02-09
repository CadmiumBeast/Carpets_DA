import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <img src="/images/logo.png" alt="Carpets.lk" />
        </Link>

        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              <span className="header-user">
                Welcome, {user.fullName || user.username}!
              </span>
              
              <Link to="/" className="nav-link">Home</Link>
              
              {user.role === 'customer' && (
                <>
                  <Link to="/categories" className="nav-link">Categories</Link>
                  <Link to="/contact" className="nav-link">Contact</Link>
                </>
              )}
              
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">Admin Dashboard</Link>
              )}
              
              <button onClick={logout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/categories" className="nav-link">Categories</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/signup" className="nav-link-primary">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
