import React, { useState } from 'react';
import axiosApi from '../utils/axiosApi';
import{ useNavigate } from 'react-router-dom';

function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    try {
      const { confirmPassword, ...submitForm } = form;
      const res = await axiosApi.post('/user/signup', submitForm);
      const data = res.data;
      if (res.status === 201) {
        setMessage('Signup successful!');
        setForm({ username: '', email: '', password: '', confirmPassword: '' });
        navigate('/signin');
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

  return (
    <div>
      <h2>Signup Page </h2>
      <h4>Already have an Account? <span style={{cursor: 'pointer', color: 'blue', textDecoration: 'underline'}} onClick={() => (navigate('/signin'))}>Signin</span></h4>
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
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
        <button type="submit" style={{cursor: 'pointer'}}>Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Signup;
