import React, { useState } from 'react';
import axiosApi from '../utils/axiosApi';
import useUser from '../apis/getUser';

function Signin() {
  const { user, loading } = useUser();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');

  if (user && !loading) {
    window.location.href = '/';
  }
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axiosApi.post('/user/signin', form);
      const data = await res.data;
      if (res.status === 201) {
        setMessage('Signin successful!');
        setForm({ email: '', password: '' });
        // Optionally redirect to home or login page
        window.location.href = '/';
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
      <h2>Sign In Page</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: 300 }}>
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
        <button type="submit">Sign In</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Signin;
