import React, { useState } from 'react';
import axiosApi from '../utils/axiosApi';
import useUser from '../apis/getUser';
import { useNavigate, useLocation } from 'react-router-dom';

function Signin() {
  const { user, loading } = useUser();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get 'from' from location.state or from query param
  let from = location.state?.from || '/';
  if (location.search) {
    const params = new URLSearchParams(location.search);
    if (params.get('from')) {
      from = params.get('from');
    }
  }

  // If already signed in, redirect to previous page or home
  if (user && !loading) {
    window.location.href = from;
  }
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axiosApi.post('/user/signin', form, { skipAuthInterceptor: true });
      const data = await res.data;
      if (res.status === 201) {
        setMessage('Signin successful!');
        window.location.href = from;
      } else {
        setMessage(data.message || 'Signin failed.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage(err.message || 'Server error.');
      }
    }
  };

  return (
    <div>
      <h1>SignIn Page</h1>
      <h3>Don't have an Account? <span style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}} onClick={() => (navigate('/signup'))}>Sign Up</span></h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: 300, }}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit" style={{cursor: 'pointer' }}>Sign In</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Signin;
