import React from 'react';
import { Link } from 'react-router-dom';
import useUser from '../apis/getUser';
import axiosApi from '../utils/axiosApi';
import '../styles/Navbar.css';

function Navbar() {
  const { user, loading } = useUser();
  const handleLogout = async () => {
    try {
      await axiosApi.post('/user/logout');
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <span className="navbar-logo-icon">🧠</span>
        <span>Quiz App</span>
      </Link>
      <div className="navbar-links">
        <Link to="/" className="navbar-link">Home</Link>
        <Link to="/take-quiz" className="navbar-link">Take Quiz</Link>
        <Link to="/create-quiz" className="navbar-link">Create Quiz</Link>
        
        {!loading && user ? (
          <>
            <div 
              className="user-profile"
              onClick={() => window.location.href = `/profile/${user.username}`}
            >
              <div className="avatar">{getInitials(user.username)}</div>
              <span className="username">{user.username}</span>
            </div>
            <button 
              className="navbar-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signup" className="navbar-link">Sign Up</Link>
            <Link to="/signin" className="navbar-button">Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
