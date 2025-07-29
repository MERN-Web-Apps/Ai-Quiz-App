import React, { useState, useEffect } from 'react';
import axiosApi from '../utils/axiosApi';
import useUser from '../apis/getUser';
import GoogleButton from 'react-google-button';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Auth.css';

function Signup() {
  const { user, loading } = useUser();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path if exists
  let from = location.state?.from || '/';
  if (location.search) {
    const params = new URLSearchParams(location.search);
    if (params.get('from')) {
      from = params.get('from');
    }
  }

  // If already signed in, redirect
  if (user && !loading) {
    window.location.href = from;
  }

  // Animation effect for form elements
  useEffect(() => {
    const formElements = document.querySelectorAll('.auth-form-control, .auth-button, .auth-divider, .auth-google-button');
    formElements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('appear');
      }, 100 * index);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // Validation
    if (form.password !== form.confirmPassword) {
      setMessageType('error');
      setMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await axiosApi.post('/user/signup', form, { skipAuthInterceptor: true });
      const data = await res.data;
      if (res.status === 201) {
        setMessageType('success');
        setMessage('Account created successfully! Redirecting to sign in...');
        setTimeout(() => {
          navigate('/signin');
        }, 2000);
      } else {
        setMessageType('error');
        setMessage(data.message || 'Signup failed.');
      }
    } catch (err) {
      setMessageType('error');
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage(err.message || 'Server error.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    // Redirect to your backend Google OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/auth/google`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p className="auth-subtitle">Join us and start creating quizzes</p>
        </div>
        
        {message && (
          <div className={`auth-message ${messageType}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <div className="auth-form-control">
              <input
                type="text"
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="Username"
                autoComplete="username"
              />
              <label htmlFor="username">Username</label>
              <div className="auth-input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>
            
            <div className="auth-form-control">
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Email"
                autoComplete="email"
              />
              <label htmlFor="email">Email</label>
              <div className="auth-input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
            </div>
            
            <div className="auth-form-control">
              <input
                type="password"
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Password"
                autoComplete="new-password"
              />
              <label htmlFor="password">Password</label>
              <div className="auth-input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            </div>
            
            <div className="auth-form-control">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm Password"
                autoComplete="new-password"
              />
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="auth-input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Move button outside form group and remove the animations */}
          <button 
            type="submit" 
            className="auth-button auth-button-primary"
            disabled={isSubmitting}
            style={{marginTop: "20px"}}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                <span>Creating Account...</span>
              </>
            ) : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-divider">
          <span>OR</span>
        </div>
        
        <div className="auth-google-button">
          <GoogleButton 
            onClick={handleGoogleSignup}
            style={{width: '100%'}}
            label="Sign up with Google"
          />
        </div>
        
        <div className="auth-footer">
          <p>Already have an account? <button onClick={() => navigate('/signin')} className="auth-text-button">Sign In</button></p>
        </div>
      </div>
      
      <div className="auth-background">
        <div className="auth-shape auth-shape-1"></div>
        <div className="auth-shape auth-shape-2"></div>
        <div className="auth-shape auth-shape-3"></div>
        <div className="auth-shape auth-shape-4"></div>
      </div>
    </div>
  );
}

export default Signup;
