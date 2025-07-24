import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const navigate = useNavigate();
  
  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Welcome to the Quiz App</h1>
        <p className="home-subtitle">
          Explore a world of knowledge with our interactive quizzes. Take challenges created by others or craft your own unique quiz experience with AI assistance.
        </p>
      </div>
      
      <div className="home-buttons">
        <button
          className="home-button take-quiz-btn"
          onClick={() => navigate('/take-quiz')}
        >
          <span className="button-icon">📝</span>
          Take Quiz
        </button>
        <button
          className="home-button create-quiz-btn"
          onClick={() => navigate('/create-quiz')}
        >
          <span className="button-icon">✨</span>
          Create Quiz
        </button>
      </div>
      
      <div className="features-section">
        <h2 className="section-title">Why Choose Our Quiz App?</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🤖</span>
            <h3 className="feature-title">AI-Powered Questions</h3>
            <p className="feature-description">
              Our advanced AI creates engaging, challenging questions tailored to your specified topics.
            </p>
          </div>
          
          <div className="feature-card">
            <span className="feature-icon">🌐</span>
            <h3 className="feature-title">Share with Friends</h3>
            <p className="feature-description">
              Create public or private quizzes and share them with friends using a simple quiz code.
            </p>
          </div>
          
          <div className="feature-card">
            <span className="feature-icon">🏆</span>
            <h3 className="feature-title">Leaderboards</h3>
            <p className="feature-description">
              Compete with others and track your progress on global and quiz-specific leaderboards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;