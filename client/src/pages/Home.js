// import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  // const navigate = useNavigate();
  
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
          style={{
            padding: '20px 60px',
            fontSize: '24px',
            background: 'linear-gradient(90deg, #4e54c8, #8f94fb)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(78,84,200,0.2)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onClick={() => window.location.href = '/take-quiz'}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span className="button-icon">📝</span>
          Take Quiz
        </button>
        <button
          style={{
            padding: '20px 60px',
            fontSize: '24px',
            background: 'linear-gradient(90deg, #ff512f, #dd2476)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(221,36,118,0.2)',
            cursor: 'pointer',
            transition: 'transform 0.2s',
          }}
          onClick={() => window.location.href = '/create-quiz'}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
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