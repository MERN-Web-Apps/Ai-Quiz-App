import { useParams, Link } from 'react-router-dom';
import axiosApi from '../utils/axiosApi';
import { useEffect, useState, useRef } from 'react';
import { getConfig } from '../configLoader';
import '../styles/Profile.css';
import Chart from 'chart.js/auto';

function Profile() {
  
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', currentPassword: '', password: '', confirmPassword: '', profileImage: null });
  const [previewImg, setPreviewImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [quizHistory, setQuizHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const scoreChartRef = useRef(null);
  const progressChartRef = useRef(null);
  const baseUrl = getConfig().baseUrl;
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosApi.get(`profile/${username}`);
        const data = await res.data;
        console.log("Profile data:", data); // Debug log to check data structure
        setData(data);
        
        // Check for quiz data in the correct structure
        if (data && data.user && data.user.quizzes && data.user.quizzes.length > 0) {
          console.log("Quiz history found:", data.user.quizzes);
          setQuizHistory(data.user.quizzes);
        } else {
          console.log("No quiz history found in data");
        }
        
        setForm({
          username: data.user.username,
          email: data.user.email,
          currentPassword: '',
          password: '',
          confirmPassword: '',
          profileImage: null
        });
        setPreviewImg(baseUrl+`/imgs/${data.user.profileImage}`);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [username, baseUrl]);

  // Initialize charts after data is loaded
  useEffect(() => {
    // Debug log
    console.log("Chart effect running, quizHistory:", quizHistory, "activeTab:", activeTab);
    
    let scoreChart;
    let progressChart;
    
    if (quizHistory && quizHistory.length > 0 && activeTab === 'progress' && scoreChartRef.current && progressChartRef.current) {
      console.log("Creating charts with data:", quizHistory);
      
      // Destroy existing charts if they exist
      if (scoreChartRef.current.chart) {
        scoreChartRef.current.chart.destroy();
      }
      
      if (progressChartRef.current.chart) {
        progressChartRef.current.chart.destroy();
      }
      
      try {
        // Create score trend chart
        const scoreCtx = scoreChartRef.current.getContext('2d');
        scoreChart = new Chart(scoreCtx, {
          type: 'line',
          data: {
            labels: quizHistory.map((_, index) => `Quiz ${index + 1}`),
            datasets: [{
              label: 'Score',
              data: quizHistory.map(quiz => quiz.score),
              borderColor: '#4CAF50',
              backgroundColor: 'rgba(76, 175, 80, 0.2)',
              tension: 0.1,
              fill: true
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Score'
                }
              }
            }
          }
        });
        
        // Create quiz performance chart - using rank data
        const progressCtx = progressChartRef.current.getContext('2d');
        
        // For the second chart, let's show quiz performance by rank
        const rankData = {};
        quizHistory.forEach(quiz => {
          const rankCategory = quiz.rank <= 3 ? 'Top 3' : 
                              quiz.rank <= 10 ? 'Top 10' : 'Other';
          rankData[rankCategory] = (rankData[rankCategory] || 0) + 1;
        });
        
        progressChart = new Chart(progressCtx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(rankData),
            datasets: [{
              data: Object.values(rankData),
              backgroundColor: [
                '#4CAF50', // Green for Top 3
                '#FFCE56', // Yellow for Top 10
                '#FF6384'  // Red for Other
              ]
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              },
              title: {
                display: true,
                text: 'Quiz Performance by Rank'
              }
            }
          }
        });
        
        // Store chart instances for cleanup
        scoreChartRef.current.chart = scoreChart;
        progressChartRef.current.chart = progressChart;
        
        console.log("Charts created successfully");
      } catch (error) {
        console.error("Error creating charts:", error);
      }
    }
    
    // Cleanup function
    return () => {
      if (scoreChart) {
        try {
          scoreChart.destroy();
        } catch (e) {
          console.error("Error destroying score chart:", e);
        }
      }
      if (progressChart) {
        try {
          progressChart.destroy();
        } catch (e) {
          console.error("Error destroying progress chart:", e);
        }
      }
    };
  }, [data, quizHistory, activeTab]);

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
            
            {!editing && (
              <div className="profile-tabs">
                <button 
                  className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stats')}
                >
                  Statistics
                </button>
                <button 
                  className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
                  onClick={() => setActiveTab('progress')}
                >
                  Progress
                </button>
                <button 
                  className={`tab-button ${activeTab === 'quizzes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('quizzes')}
                >
                  Quizzes
                </button>
              </div>
            )}
            
            {activeTab === 'stats' && (
              <div className="profile-stats">
                <div className="stat-box">
                  <div className="stat-count">{data.user.quizzes ? data.user.quizzes.length : 0}</div>
                  <div className="stat-label">Quiz Attempts</div>
                </div>
                <div className="stat-box">
                  <div className="stat-count">
                    {data.user.quizzes && data.user.quizzes.length > 0 
                      ? Math.round(data.user.quizzes.reduce((acc, quiz) => acc + quiz.score, 0) / data.user.quizzes.length) 
                      : 0}
                  </div>
                  <div className="stat-label">Average Score</div>
                </div>
                <div className="stat-box">
                  <div className="stat-count">
                    {data.user.quizzes && data.user.quizzes.length > 0 
                      ? data.user.quizzes.filter(quiz => quiz.rank <= 3).length 
                      : 0}
                  </div>
                  <div className="stat-label">Top 3 Finishes</div>
                </div>
              </div>
            )}
            
            {activeTab === 'progress' && (
              <div className="charts-container">
                <div className="chart-wrapper">
                  <h3>Score Progress</h3>
                  <div className="canvas-container">
                    {quizHistory && quizHistory.length > 0 ? (
                      <canvas ref={scoreChartRef}></canvas>
                    ) : (
                      <div className="no-data-message">
                        No quiz data available to show score progress.
                      </div>
                    )}
                  </div>
                </div>
                <div className="chart-wrapper">
                  <h3>Performance Distribution</h3>
                  <div className="canvas-container">
                    {quizHistory && quizHistory.length > 0 ? (
                      <canvas ref={progressChartRef}></canvas>
                    ) : (
                      <div className="no-data-message">
                        No quiz data available to show performance distribution.
                      </div>
                    )}
                  </div>
                </div>
                
                {quizHistory && quizHistory.length > 0 && (
                  <div className="time-performance-stats">
                    <h3>Time Performance</h3>
                    <div className="time-stats-grid">
                      <div className="time-stat-box">
                        <span className="time-stat-value">
                          {Math.round(quizHistory.reduce((acc, quiz) => acc + quiz.timeTaken, 0) / quizHistory.length)}s
                        </span>
                        <span className="time-stat-label">Average Time</span>
                      </div>
                      <div className="time-stat-box">
                        <span className="time-stat-value">
                          {Math.min(...quizHistory.map(quiz => quiz.timeTaken))}s
                        </span>
                        <span className="time-stat-label">Fastest Time</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'quizzes' && (
              <div className="quizzes-list">
                <h3>Quiz History</h3>
                {quizHistory && quizHistory.length > 0 ? (
                  <div className="quiz-grid">
                    {quizHistory.map((quiz) => (
                      <Link to={`/quiz/${quiz.quizId}`} className="quiz-card" key={quiz._id || quiz.quizId}>
                        <div className="quiz-title">
                          Quiz {quiz.quizId ? `#${quiz.quizId.substring(quiz.quizId.length - 6)}` : ''}
                        </div>
                        <div className="quiz-meta">
                          <span className="quiz-rank">Rank: {quiz.rank}</span>
                          <span className="quiz-score">Score: {quiz.score}</span>
                        </div>
                        <div className="quiz-time">Time taken: {quiz.timeTaken}s</div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="no-data-message">
                    No quizzes found. Start taking some quizzes to see your history!
                  </div>
                )}
                
                <div className="browse-quizzes-button">
                  <Link to="/explore" className="btn btn-primary">Find Quizzes</Link>
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
