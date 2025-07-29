import { useParams } from 'react-router-dom';
import axiosApi from '../utils/axiosApi';
import { useEffect, useState } from 'react';
import { getConfig } from '../configLoader';
import '../styles/Profile.css';

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
      // Email is no longer editable, so we don't include it in the form data
      formData.append('currentPassword', form.currentPassword);
      if (form.password) formData.append('password', form.password);
      if (form.profileImage) formData.append('profileImage', form.profileImage);
      const res = await axiosApi.put(`profile/${username}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if(res.data.message==="password updated") {
        window.location.href = '/signin';
      }else{
        window.location.href = '/profile/' + formData.get('username');
      }
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{editing ? 'Edit Profile' : 'Profile'}</h1>
      </div>

      <div className="profile-card">
        {!editing && editable && (
          <button className="edit-btn" onClick={() => setEditing(true)} aria-label="Edit profile">
            <svg className="edit-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        )}
        
        {editing ? (
          <>
            <div className="profile-image-container">
              <img
                src={previewImg}
                alt="Profile"
                className="profile-image"
                onError={e => { e.target.onerror = null; e.target.src = baseUrl + '/imgs/default.jpeg'; }}
              />
              <div className="image-upload">
                <label className="image-upload-label" htmlFor="profile-image-upload">
                  Change Image
                </label>
                <input 
                  id="profile-image-upload"
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  disabled={loading} 
                />
              </div>
            </div>
            
            <div className="profile-info">
              <div className="info-row">
                <label htmlFor="username">Username</label>
                <input 
                  type="text" 
                  id="username"
                  name="username" 
                  value={form.username} 
                  onChange={handleChange} 
                  disabled={loading} 
                />
              </div>
              
              <div className="info-row">
                <label>Email</label>
                <span className="static-text">{form.email}</span>
              </div>
              
              <div className="info-row required">
                <label htmlFor="currentPassword">Current Password</label>
                <input 
                  type="password" 
                  id="currentPassword"
                  name="currentPassword" 
                  value={form.currentPassword} 
                  onChange={handleChange} 
                  disabled={loading} 
                  required 
                />
              </div>
              
              <div className="info-row">
                <label htmlFor="password">New Password</label>
                <input 
                  type="password" 
                  id="password"
                  name="password" 
                  value={form.password} 
                  onChange={handleChange} 
                  disabled={loading} 
                />
              </div>
              
              <div className="info-row">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirmPassword"
                  name="confirmPassword" 
                  value={form.confirmPassword} 
                  onChange={handleChange} 
                  disabled={loading} 
                />
              </div>
              
              {message && <div className="error-message">{message}</div>}
            </div>
            
            <div className="profile-actions">
              <button 
                className="btn btn-outline" 
                onClick={handleCancel} 
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSave} 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Saving...
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="view-profile">
              <img
                src={imgUrl}
                alt="Profile"
                className="profile-image"
                onError={e => { e.target.onerror = null; e.target.src = baseUrl + '/imgs/default.jpeg'; }}
              />
            </div>
            
            <div className="profile-info">
              <div className="info-row">
                <label>Username</label>
                <span className="static-text">{data.user.username}</span>
              </div>
              
              <div className="info-row">
                <label>Email</label>
                <span className="static-text">{data.user.email}</span>
              </div>
            </div>
            
            {data.stats && (
              <div className="profile-stats">
                <div className="stat-box">
                  <div className="stat-count">{data.stats.quizzes || 0}</div>
                  <div className="stat-label">Quizzes Created</div>
                </div>
                <div className="stat-box">
                  <div className="stat-count">{data.stats.attempts || 0}</div>
                  <div className="stat-label">Quiz Attempts</div>
                </div>
                <div className="stat-box">
                  <div className="stat-count">{data.stats.score || 0}</div>
                  <div className="stat-label">Total Score</div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
