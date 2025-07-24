import { useParams } from 'react-router-dom';
import axiosApi from '../utils/axiosApi';
import { useEffect, useState } from 'react';
import { getConfig } from '../configLoader';

function Profile() {
  
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', currentPassword: '', password: '', confirmPassword: '', profileImage: null });
  const [previewImg, setPreviewImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const baseUrl = getConfig().baseUrl;
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosApi.get(`profile/${username}`);
        const data = await res.data;
        setData(data);
        setForm({
          username: data.user.username,
          email: data.user.email,
          currentPassword: '',
          password: '',
          confirmPassword: '',
          profileImage: null
        });
        setPreviewImg(baseUrl+`/imgs/${data.user.profileImage}`);
      } catch (err) {}
    };
    fetchProfile();
  }, [username, baseUrl]);

  if (!data) {
    return <div>Loading profile...</div>;
  }
  const editable = data.edit;
  const imgUrl = baseUrl+`/imgs/${data.user.profileImage}`;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, profileImage: file });
    if (file) {
      setPreviewImg(URL.createObjectURL(file));
    } else {
      setPreviewImg(imgUrl);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      username: data.user.username,
      email: data.user.email,
      currentPassword: '',
      password: '',
      confirmPassword: '',
      profileImage: null
    });
    setPreviewImg(imgUrl);
  };

  const handleSave = async () => {
    setMessage('');
    if (!form.currentPassword) {
      setMessage('Current password is required.');
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', form.username);
      formData.append('email', form.email);
      formData.append('currentPassword', form.currentPassword);
      if (form.password) formData.append('password', form.password);
      if (form.profileImage) formData.append('profileImage', form.profileImage);
      await axiosApi.put(`profile/${username}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      window.location.href = '/signin';
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {editing ? (
        <>
          <h1>Edit Profile</h1>
          <img
            src={previewImg}
            alt="Profile"
            style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }}
          />
          <div>
            <label>Change Image: </label>
            <input type="file" accept="image/*" onChange={handleFileChange} disabled={loading} />
          </div>
          <div>
            <label>User Name: </label>
            <input type="text" name="username" value={form.username} onChange={handleChange} disabled={loading} />
          </div>
          <div>
            <label>Email: </label>
            <input type="email" name="email" value={form.email} onChange={handleChange} disabled={loading} />
          </div>
          <div>
            <label>Current Password: <span style={{color:'red'}}>*</span></label>
            <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} disabled={loading} required />
          </div>
          <div>
            <label>New Password: </label>
            <input type="password" name="password" value={form.password} onChange={handleChange} disabled={loading} />
          </div>
          <div>
            <label>Confirm Password: </label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} disabled={loading} />
          </div>
          {message && <p style={{color:'red'}}>{message}</p>}
          <button onClick={handleSave} disabled={loading}>Save</button>
          <button onClick={handleCancel} disabled={loading}>Cancel</button>
        </>
      ) : (
        <>
          <h1>Profile Page</h1>
          <img
            src={imgUrl}
            alt="Profile"
            style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }}
          />
          <h2>Username: {data.user.username}</h2>
          <h3>Email: {data.user.email}</h3>
          {editable && (
            <button onClick={() => setEditing(true)}>Edit</button>
          )}
        </>
      )}
    </div>
  );
}

export default Profile;
