import React from 'react';
import { Link } from 'react-router-dom';
import useUser from '../apis/getUser';
import axiosApi from '../utils/axiosApi';

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

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 30px',
      background: '#282c34',
      color: 'white',
      marginBottom: 30
    }}>
      <div style={{ fontWeight: 'bold', fontSize: 22 }}>
        Quiz App
      </div>
      <div>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', marginRight: 20 }}>Home</Link>
        {!loading && user ? (
          <>
            <span
              style={{ color: 'white', textDecoration: 'none', marginRight: 20, cursor: 'pointer' }}
              onClick={() => window.location.href = `/profile/${user.username}`}
            >{user.username}</span>
            <span
              onClick={handleLogout} style={{ color: 'white', textDecoration: 'none', cursor: 'pointer' }}
            >Logout</span>

          </>
        ) : (
          <>
            <Link to="/signup" style={{ color: 'white', textDecoration: 'none', marginRight: 20 }}>Signup</Link>
            <Link to="/signin" style={{ color: 'white', textDecoration: 'none' }}>Sign In</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
