import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosApi from '../utils/axiosApi';
import '../styles/QuizTaking.css';

function QuizTaking() {
  const { code } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchQuiz();
  }, [code]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizStarted, timeLeft]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await axiosApi.get(`/quiz/${code}?mode=take`);
      if (res.status === 200) {
        setQuiz(res.data.quiz);
        setTimeLeft(res.data.quiz.duration * 60); // Convert minutes to seconds
        setQuizStarted(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: selectedOption
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return; // Prevent double submission
    
    try {
      setSubmitting(true);
      
      // Format answers for submission
      const formattedAnswers = quiz.questions.map((question, index) => ({
        questionId: question._id,
        selectedOption: answers[index] || null
      }));

      console.log('Submitting answers:', formattedAnswers);
      
      // Submit the quiz
      const response = await axiosApi.post(`/quiz/${code}/submit`, {
        answers: formattedAnswers
      });

      // Navigate to results page with submission data
      navigate(`/quiz/${code}/results`, {
        state: {
          ...response.data,
          userAnswers: formattedAnswers
        }
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err.response?.data?.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((currentQuestion + 1) / quiz.questions.length) * 100;
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="spinner large"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-error">
        <div className="error-content">
          <h2>Unable to Load Quiz</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate(`/quiz/${code}`)}>
            Back to Quiz Info
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="quiz-taking-container">
      <div className="quiz-header">
        <div className="quiz-info">
          <h1 className="quiz-title">{quiz.title}</h1>
          <p className="quiz-code">Quiz Code: #{quiz.code}</p>
        </div>
        
        <div className="quiz-timer">
          <div className={`timer ${timeLeft <= 300 ? 'timer-warning' : ''} ${timeLeft <= 60 ? 'timer-danger' : ''}`}>
            <span className="timer-icon">⏰</span>
            <span className="timer-text">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div className="quiz-progress">
        <div className="progress-info">
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
          <span>{Math.round(getProgressPercentage())}% Complete</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      <div className="question-card">
        <div className="question-header">
          <h2 className="question-number">Question {currentQuestion + 1}</h2>
        </div>
        
        <div className="question-content">
          <p className="question-text">{currentQ.question}</p>
          
          <div className="options-container">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${
                  answers[currentQuestion] === option ? 'selected' : ''
                }`}
                onClick={() => handleAnswerSelect(currentQuestion, option)}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="quiz-navigation">
        <button
          className="btn btn-secondary"
          onClick={handlePreviousQuestion}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>

        <div className="question-indicators">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              className={`question-indicator ${
                index === currentQuestion ? 'current' : ''
              } ${
                answers.hasOwnProperty(index) ? 'answered' : ''
              }`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            className="btn btn-success"
            onClick={handleSubmitQuiz}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleNextQuestion}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

export default QuizTaking;
