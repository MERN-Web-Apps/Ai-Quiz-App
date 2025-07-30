import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axiosApi from '../utils/axiosApi';
import useUser from '../apis/getUser';
import '../styles/QuizResults.css';

const QuizResults = () => {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // Get submission data from navigation state
  const submissionData = location.state;

  useEffect(() => {
    if (!submissionData) {
      navigate('/take-quiz');
      return;
    }

    if (submissionData.hasEnded) {
      // Quiz has ended, results are already available
      setResults(submissionData);
      setLoading(false);
    } else {
      // Quiz hasn't ended, show waiting screen and poll for results
      setResults(submissionData);
      setLoading(false);
      
      // Calculate time remaining
      const endTime = new Date(submissionData.quizEndTime);
      const updateTimeRemaining = () => {
        const now = new Date();
        const remaining = Math.max(0, endTime - now);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          // Quiz has ended, fetch results
          fetchResults();
          // Clear the interval after fetching results
          return true; // Signal to clear interval
        }
        return false;
      };
      
      updateTimeRemaining();
      const interval = setInterval(() => {
        const shouldClear = updateTimeRemaining();
        if (shouldClear) {
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [submissionData, navigate]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axiosApi.post(`/quiz/${code}/submit`, {
        answers: submissionData.userAnswers || [],
        getResults: true
      });
      // Update results with hasEnded flag to stop further updates
      setResults({
        ...response.data,
        hasEnded: true
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching results');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return '#4CAF50'; // Green
    if (percentage >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return 'Excellent! 🎉';
    if (percentage >= 80) return 'Great job! 👏';
    if (percentage >= 70) return 'Good work! 👍';
    if (percentage >= 60) return 'Not bad! 😊';
    return 'Keep practicing! 💪';
  };

  if (loading) {
    return (
      <div className="quiz-results">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-results">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/take-quiz')} className="btn btn-primary">
            Back to Take Quiz
          </button>
        </div>
      </div>
    );
  }

  if (!results.hasEnded) {
    return (
      <div className="quiz-results">
        <div className="waiting-container">
          <div className="success-icon">✅</div>
          <h1>Quiz Submitted Successfully!</h1>
          <h2>{results.quizTitle}</h2>
          
          <div className="waiting-message">
            <p>{results.message}</p>
            <div className="time-remaining">
              <h3>Time remaining until results:</h3>
              <div className="countdown">{formatTime(timeRemaining)}</div>
            </div>
          </div>
          
          <div className="waiting-actions">
            <button onClick={() => navigate('/take-quiz')} className="btn btn-secondary">
              Take Another Quiz
            </button>
            <button 
              onClick={() => user ? navigate(`/profile/${user.username}`) : navigate('/signin')} 
              className="btn btn-primary"
            >
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show full results
  return (
    <div className="quiz-results">
      <div className="results-container">
        <div className="results-header">
          <h1>Quiz Results</h1>
          <h2>{results.quizTitle}</h2>
          
          <div className="score-summary">
            <div className="score-circle" style={{ borderColor: getScoreColor(results.percentage) }}>
              <div className="score-percentage" style={{ color: getScoreColor(results.percentage) }}>
                {results.percentage}%
              </div>
              <div className="score-fraction">
                {results.score}/{results.totalQuestions}
              </div>
            </div>
            <div className="score-message">
              <h3 style={{ color: getScoreColor(results.percentage) }}>
                {getScoreMessage(results.percentage)}
              </h3>
            </div>
          </div>
        </div>

        <div className="questions-review">
          <h3>Question Review</h3>
          {results.results.map((result, index) => (
            <div key={result.questionId} className={`question-result ${result.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="question-header">
                <span className="question-number">Question {index + 1}</span>
                <span className={`result-badge ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                  {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>
              
              <div className="question-text">
                <p>{result.question}</p>
              </div>
              
              <div className="options-review">
                {result.options.map((option, optIndex) => {
                  const optionLetter = String.fromCharCode(65 + optIndex);
                  const isCorrect = option === result.correctAnswer;
                  const isUserAnswer = option === result.userAnswer;
                  
                  let optionClass = 'option-review';
                  if (isCorrect) optionClass += ' correct-answer';
                  if (isUserAnswer && !isCorrect) optionClass += ' user-wrong';
                  if (isUserAnswer && isCorrect) optionClass += ' user-correct';
                  
                  return (
                    <div key={optIndex} className={optionClass}>
                      <span className="option-letter">{optionLetter}</span>
                      <span className="option-text">{option}</span>
                      {isCorrect && <span className="correct-indicator">✓</span>}
                      {isUserAnswer && !isCorrect && <span className="wrong-indicator">✗</span>}
                    </div>
                  );
                })}
              </div>
              
              {result.explanation && (
                <div className="explanation">
                  <h4>Explanation:</h4>
                  <p>{result.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="results-actions">
          <button onClick={() => navigate('/take-quiz')} className="btn btn-primary">
            Take Another Quiz
          </button>
          <button 
            onClick={() => user ? navigate(`/profile/${user.username}`) : navigate('/signin')} 
            className="btn btn-secondary"
          >
            Go to Profile
          </button>
          <button onClick={() => window.print()} className="btn btn-outline">
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
