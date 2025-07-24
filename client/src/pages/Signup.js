import React, { useState } from 'react';
import axiosApi from '../utils/axiosApi';
import GoogleButton from 'react-google-button';

function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axiosApi.post('/user/signup', form);
      const data = res.data;
      if (res.status === 201) {
        setMessage('Signup successful!');
        setForm({ username: '', email: '', password: '' });
        window.location.href = '/signin';
      } else {
        setMessage(data.message || 'Signup failed.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setMessage(err.response.data.message);
      } else {
        setMessage(err.message || 'Server error.');
      }
    }
  };

  const handleGoogleSignin = () => {
    // Redirect to your backend Google OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/auth/google`;
  };

  return (
    <div>
      <h2>Signup Page </h2>
      <h4>Already have an Account? <span style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}} onClick={() => (window.location.href = '/signin')}>Signin</span></h4>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
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
        <button type="submit" style={{cursor: 'pointer'}}>Sign Up</button>
      </form>
      
      <div style={{ maxWidth: 300, margin: '20px 0' }}>
        <p style={{ textAlign: 'center', margin: '10px 0' }}>OR</p>
        <GoogleButton onClick={handleGoogleSignin} />
      </div>
      
      {message && <p>{message}</p>}
    </div>
  );
}

export default Signup;
