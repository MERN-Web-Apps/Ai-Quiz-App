import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import Signin from './pages/Signin';
import Profile from './pages/Profile';
import Home from './pages/Home';
import PageNotFound from './pages/404';
import CreateQuiz from './pages/Create_quiz';
import TakeQuiz from './pages/TakeQuiz';
import QuizInfo from './pages/QuizInfo';
import QuizTaking from './pages/QuizTaking';

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
          <Route path="/take-quiz" element={<TakeQuiz />} />
          <Route path="/quiz/:code" element={<QuizInfo />} />
          <Route path="/quiz/:code/take" element={<QuizTaking />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
