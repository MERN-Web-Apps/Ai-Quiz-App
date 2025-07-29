import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import Signin from './pages/Signin';
import Profile from './pages/Profile';
import Home from './pages/Home';
import PageNotFound from './pages/404';
import CreateQuiz from './pages/Create_quiz';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/leaderboard';

function App() {

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/create-quiz" element={<CreateQuiz />} />
          <Route path="/quiz/:quizCode" element={<Quiz />} />
          <Route path="/quiz/:quizCode/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
