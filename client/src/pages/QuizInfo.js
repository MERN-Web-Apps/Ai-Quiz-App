import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosApi from '../utils/axiosApi';
import '../styles/QuizInfo.css';

function QuizInfo() {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeUntilStart, setTimeUntilStart] = useState(null);
  const [canStart, setCanStart] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchQuizInfo();
  }, [code]);

  useEffect(() => {
    if (quiz) {
      const checkQuizTiming = () => {
        const now = new Date();
        const startTime = new Date(quiz.startTime);
        const endTime = new Date(startTime.getTime() + quiz.duration * 60000);
        
        if (now < startTime) {
          // Quiz hasn't started yet
          const timeDiff = startTime.getTime() - now.getTime();
          setTimeUntilStart(timeDiff);
          setCanStart(false);
        } else if (now >= startTime && now < endTime) {
          // Quiz is active
          setTimeUntilStart(null);
          setCanStart(true);
        } else {
          // Quiz has ended
          setTimeUntilStart(null);
          setCanStart(false);
        }
      };

      checkQuizTiming();
      const interval = setInterval(checkQuizTiming, 1000);
      return () => clearInterval(interval);
    }
  }, [quiz]);

  const fetchQuizInfo = async () => {
    try {
      setLoading(true);
      const res = await axiosApi.get(`/quiz/${code}?mode=info`);
      if (res.status === 200) {
        setQuiz(res.data.quiz);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz information');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = () => {
    navigate(`/quiz/${code}/take`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatCountdown = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getQuizStatus = () => {
    const now = new Date();
    const startTime = new Date(quiz.startTime);
    const endTime = new Date(startTime.getTime() + quiz.duration * 60000);

    if (now < startTime) {
      return 'upcoming';
    } else if (now >= startTime && now < endTime) {
      return 'active';
    } else {
      return 'ended';
    }
  };

  if (loading) {
    return (
      <div className="quiz-info-loading">
        <div className="spinner large"></div>
        <p>Loading quiz information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-info-error">
        <div className="error-content">
          <h2>Quiz Not Found</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/take-quiz')}>
            Back to Take Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const quizStatus = getQuizStatus();

  return (
    <div className="quiz-info-container">
      <div className="quiz-info-header">
        <button 
          className="btn btn-secondary back-btn"
          onClick={() => navigate('/take-quiz')}
        >
          ← Back to Quiz List
        </button>
      </div>

      <div className="quiz-info-card">
        <div className="quiz-info-main">
          <div className="quiz-badge">
            <span className="quiz-code">#{quiz.code}</span>
            <span className={`quiz-status status-${quizStatus}`}>
              {quizStatus === 'upcoming' && '⏳ Upcoming'}
              {quizStatus === 'active' && '🟢 Active'}
              {quizStatus === 'ended' && '🔴 Ended'}
            </span>
          </div>

          <h1 className="quiz-title">{quiz.title}</h1>
          
          <div className="quiz-creator">
            <span className="creator-label">Created by:</span>
            <span className="creator-name">{quiz.owner?.username || 'Anonymous'}</span>
          </div>

          <div className="quiz-stats">
            <div className="stat-item">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <span className="stat-number">{quiz.questions.length}</span>
                <span className="stat-label">Questions</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <span className="stat-number">{quiz.duration}</span>
                <span className="stat-label">Minutes</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon">🗓️</div>
              <div className="stat-info">
                <span className="stat-number">{formatDate(quiz.startTime).split(',')[0]}</span>
                <span className="stat-label">Start Date</span>
              </div>
            </div>
          </div>

          <div className="quiz-timing-info">
            <h3>⏰ Timing Information</h3>
            <div className="timing-details">
              <div className="timing-item">
                <span className="timing-label">Start Time:</span>
                <span className="timing-value">{formatDate(quiz.startTime)}</span>
              </div>
              <div className="timing-item">
                <span className="timing-label">Duration:</span>
                <span className="timing-value">{quiz.duration} minutes</span>
              </div>
              <div className="timing-item">
                <span className="timing-label">End Time:</span>
                <span className="timing-value">
                  {formatDate(new Date(new Date(quiz.startTime).getTime() + quiz.duration * 60000))}
                </span>
              </div>
            </div>
          </div>

          {timeUntilStart && (
            <div className="countdown-section">
              <h3>🚀 Quiz Starts In</h3>
              <div className="countdown-timer">
                {formatCountdown(timeUntilStart)}
              </div>
              <p className="countdown-message">Get ready! The quiz will be available once the start time arrives.</p>
            </div>
          )}

          <div className="quiz-instructions">
            <h3>📋 Instructions</h3>
            <ul className="instructions-list">
              <li>Make sure you have a stable internet connection</li>
              <li>You have {quiz.duration} minutes to complete all {quiz.questions.length} questions</li>
              <li>You can navigate between questions using the Previous/Next buttons</li>
              <li>Your answers are automatically saved as you progress</li>
              <li>Submit your quiz before time runs out</li>
              <li>Once submitted, you cannot retake this quiz</li>
            </ul>
          </div>

          <div className="quiz-actions">
            {quizStatus === 'upcoming' && (
              <div className="action-disabled">
                <button className="btn btn-disabled" disabled>
                  Quiz Not Started Yet
                </button>
                <p className="action-note">Please wait until the scheduled start time.</p>
              </div>
            )}
            
            {quizStatus === 'active' && canStart && (
              <div className="action-enabled">
                <button className="btn btn-success btn-large" onClick={handleStartQuiz}>
                  🚀 Start Quiz Now
                </button>
                <p className="action-note">Good luck! Remember to manage your time wisely.</p>
              </div>
            )}
            
            {quizStatus === 'ended' && (
              <div className="action-disabled">
                <button className="btn btn-disabled" disabled>
                  Quiz Has Ended
                </button>
                <p className="action-note">This quiz is no longer available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizInfo;
