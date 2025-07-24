
import React, { useState } from 'react';
import axiosApi from '../utils/axiosApi';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateQuiz.css';

function CreateQuiz() {
  const [quizData, setQuizData] = useState({
    title: '',
    aiprompt: '',
    startTime: '',
    duration: 30,
    isPrivate: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [createdQuizCode, setCreatedQuizCode] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuizData({
      ...quizData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        title: quizData.title,
        aiprompt: quizData.aiprompt,
        startTime: new Date(quizData.startTime).toISOString(),
        duration: Number(quizData.duration),
        isPrivate: quizData.isPrivate,
      };
      
      const res = await axiosApi.post('/quiz/create', payload);
      if(res.status !== 201) {
        throw new Error('Failed to create quiz');
      } else {
        // Store the quiz code from the response
        const quizCode = res.data.quiz.code;
        setCreatedQuizCode(quizCode);
        setSuccessMessage('Quiz created successfully! Your quiz has been created and is ready to use.');
        setError('');
        // Reset form data
        setQuizData({
          title: '',
          aiprompt: '',
          startTime: '',
          duration: 30,
          isPrivate: false
        });
      }
    } catch (err) {
      setSuccessMessage('');
      setCreatedQuizCode(null);
      setError(err.response?.data?.message || 'Failed to create quiz');
      console.error('Error creating quiz:', err);
    } finally {
      setLoading(false);
      window.scrollTo(0, 0); // Scroll to top after submission
    }
  };
    
  return (
    <div className="create-quiz-container">
      <div className="quiz-header">
        <h1>Create a New Quiz</h1>
        <p className="subtitle">Set up your quiz details and let AI generate questions</p>
      </div>
      
      {error && <div className="error-alert">{error}</div>}
      {successMessage && (
        <div className="success-alert">
          <div className="success-content">
            <p>{successMessage}</p>
            {createdQuizCode && (
              <button 
                className="btn btn-success" 
                onClick={() => navigate(`/quiz/${createdQuizCode}`)}
              >
                Go to Quiz
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className="quiz-form-card">
        <form onSubmit={handleSubmit} className="quiz-form">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              <i className="icon quiz-icon"></i>Quiz Title
            </label>
            <input 
              type="text" 
              id="title"
              name="title" 
              value={quizData.title}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter a catchy title for your quiz"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="aiprompt" className="form-label">
              <i className="icon ai-icon"></i>AI Prompt
            </label>
            <textarea 
              id="aiprompt"
              name="aiprompt" 
              value={quizData.aiprompt}
              onChange={handleChange}
              required
              className="form-textarea"
              placeholder="Describe what kind of questions you want the AI to generate..."
            />
            <p className="form-hint">Be specific about topics, difficulty level, and question style</p>
          </div>
          
          <div className="form-row">
            <div className="form-group form-group-half">
              <label htmlFor="startTime" className="form-label">
                <i className="icon time-icon"></i>Start Time
              </label>
              <input 
                type="datetime-local" 
                id="startTime"
                name="startTime" 
                value={quizData.startTime}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group form-group-half">
              <label htmlFor="duration" className="form-label">
                <i className="icon duration-icon"></i>Duration (minutes)
              </label>
              <input 
                type="number" 
                id="duration"
                name="duration" 
                min="1"
                max="180"
                value={quizData.duration}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>
          
          <div className="form-group toggle-group">
            <label htmlFor="isPrivate" className="toggle-label">
              <input 
                type="checkbox" 
                id="isPrivate"
                name="isPrivate" 
                checked={quizData.isPrivate}
                onChange={handleChange}
                className="toggle-checkbox"
              />
              <div className="toggle-switch"></div>
              <span className="toggle-text">Make this quiz private</span>
            </label>
            <p className="form-hint">Private quizzes are only accessible with the quiz code</p>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Quiz...
                </>
              ) : (
                'Create Quiz'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateQuiz;
