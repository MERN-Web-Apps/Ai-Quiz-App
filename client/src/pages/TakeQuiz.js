import React, { useState, useEffect } from 'react';
import axiosApi from '../utils/axiosApi';
import { useNavigate } from 'react-router-dom';
import '../styles/TakeQuiz.css';

function TakeQuiz() {
  const [quizCode, setQuizCode] = useState('');
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingRecent, setLoadingRecent] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentQuizzes();
  }, []);

  const fetchRecentQuizzes = async () => {
    try {
      setLoadingRecent(true);
      const res = await axiosApi.get('/quiz/recent');
      if (res.status === 200) {
        setRecentQuizzes(res.data.quizzes);
      }
    } catch (err) {
      console.error('Error fetching recent quizzes:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    if (!quizCode.trim()) {
      setError('Please enter a quiz code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axiosApi.get(`/quiz/code/${quizCode.toUpperCase()}`);
      if (res.status === 200) {
        navigate(`/quiz/${quizCode.toUpperCase()}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Quiz not found or invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = (code) => {
    navigate(`/quiz/${code}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="take-quiz-container">
      <div className="quiz-header">
        <h1>Take a Quiz</h1>
        <p className="subtitle">Enter a quiz code or choose from recent public quizzes</p>
      </div>

      {error && <div className="error-alert">{error}</div>}

      {/* Quiz Code Section */}
      <div className="code-section">
        <div className="code-card">
          <h2 className="section-title">
            <i className="icon code-icon"></i>
            Enter Quiz Code
          </h2>
          <form onSubmit={handleCodeSubmit} className="code-form">
            <div className="code-input-group">
              <input
                type="text"
                value={quizCode}
                onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                placeholder="Enter quiz code (e.g., ABC123)"
                className="code-input"
                maxLength="6"
              />
              <button
                type="submit"
                className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Finding...
                  </>
                ) : (
                  'Start Quiz'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recent Quizzes Section */}
      <div className="recent-section">
        <h2 className="section-title">
          <i className="icon recent-icon"></i>
          Recent Public Quizzes
        </h2>
        
        {loadingRecent ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading recent quizzes...</p>
          </div>
        ) : (
          <div className="quizzes-grid">
            {recentQuizzes.length > 0 ? (
              recentQuizzes.map((quiz) => (
                <div key={quiz._id} className="quiz-card">
                  <div className="quiz-card-header">
                    <h3 className="quiz-title">{quiz.title}</h3>
                    <span className="quiz-code">#{quiz.code}</span>
                  </div>
                  
                  <div className="quiz-details">
                    <div className="quiz-info">
                      <span className="info-item">
                        <i className="icon time-icon"></i>
                        {quiz.duration} minutes
                      </span>
                      <span className="info-item">
                        <i className="icon questions-icon"></i>
                        {quiz.questions.length} questions
                      </span>
                    </div>
                    
                    <div className="quiz-timing">
                      <p className="start-time">
                        Starts: {formatDate(quiz.startTime)}
                      </p>
                    </div>
                    
                    <div className="quiz-description">
                      <p className="quiz-summary">
                        Test your knowledge with this carefully crafted quiz. 
                        Good luck and do your best!
                      </p>
                    </div>
                  </div>

                  <button
                    className="btn btn-primary quiz-start-btn"
                    onClick={() => handleQuizSelect(quiz.code)}
                  >
                    View Quiz Details
                  </button>
                </div>
              ))
            ) : (
              <div className="no-quizzes">
                <i className="icon empty-icon"></i>
                <h3>No Recent Quizzes</h3>
                <p>Be the first to create a public quiz!</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/create-quiz')}
                >
                  Create a Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TakeQuiz;
