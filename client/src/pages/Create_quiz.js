import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosApi from '../utils/axiosApi';
import { useAlert } from '../components/AlertProvider';

// Import components
import QuestionsList from '../components/quiz/QuestionsList';
import QuestionModal from '../components/quiz/QuestionModal';
import GenerateModal from '../components/quiz/GenerateModal';
import SuccessMessage from '../components/quiz/SuccessMessage';
import InfoMessage from '../components/quiz/InfoMessage';

// Import utilities and styles
import { formatQuestionsFromServer, formatQuestionsForServer, validateQuestion } from '../utils/questionUtils';
import '../styles/CreateQuiz.css';
import '../styles/QuestionComponents.css';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [quizData, setQuizData] = useState({
    title: '',
    startTime: '',
    duration: 30,
    questions: [],
    isPrivate: false
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: [],
    explanation: ''
  });

  const [message, setMessage] = useState('');
  const [modalError, setModalError] = useState('');
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);
  const [aiPrompt, setAiPrompt] = useState('');
  const [numQuestions, setNumQuestions] = useState(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizCode, setQuizCode] = useState('');
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [createdQuizCode, setCreatedQuizCode] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');

  const handleQuizChange = (e) => {
    setQuizData({
      ...quizData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      [e.target.name]: e.target.value
    });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...currentQuestion.options];
    updatedOptions[index] = {
      ...updatedOptions[index],
      text: value
    };
    
    // Clear specific error messages when they're fixed
    if (modalError === `Option ${String.fromCharCode(65 + index)} cannot be empty` && value.trim()) {
      setModalError('');
    }
    
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions
    });
  };

  const toggleCorrectAnswer = (index) => {
    const updatedOptions = [...currentQuestion.options];
    const option = updatedOptions[index];
    
    // If trying to mark an empty option as correct, show error
    if (!option.text.trim() && !option.isCorrect) {
      setModalError('Cannot mark an empty option as correct');
      return;
    }
    
    // Clear error if it was related to this
    if (modalError === 'Cannot mark an empty option as correct') {
      setModalError('');
    }
    
    updatedOptions[index] = {
      ...option,
      isCorrect: !option.isCorrect
    };
    
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions
    });
  };

  const addOption = () => {
    // Check if there's already an empty option
    const emptyOptionIndex = currentQuestion.options.findIndex(opt => !opt.text.trim());
    if (emptyOptionIndex !== -1) {
      setModalError(`Please fill Option ${String.fromCharCode(65 + emptyOptionIndex)} before adding a new option`);
      return;
    }
    
    // Clear any related error message
    if (modalError && modalError.includes('before adding a new option')) {
      setModalError('');
    }
    
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { text: '', isCorrect: false }]
    });
  };

  const removeOption = (index) => {
    const updatedOptions = [...currentQuestion.options];
    updatedOptions.splice(index, 1);
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions
    });
  };

  const openQuestionModal = () => {
    setEditingQuestionIndex(-1); // Reset editing index when adding a new question
    setCurrentQuestion({
      question: '',
      options: [],
      explanation: ''
    });
    setModalError(''); // Clear any previous modal errors
    setShowQuestionModal(true);
  };

  const closeQuestionModal = () => {
    setShowQuestionModal(false);
    setEditingQuestionIndex(-1);
    setModalError(''); // Clear modal errors when closing
  };
  
  const openGenerateModal = () => {
    setShowGenerateModal(true);
    setModalError('');
  };
  
  const closeGenerateModal = () => {
    setShowGenerateModal(false);
    setModalError('');
  };
  
  const editQuestion = (index) => {
    setEditingQuestionIndex(index);
    setCurrentQuestion({...quizData.questions[index]});
    setModalError(''); // Clear any previous modal errors
    setShowQuestionModal(true);
  };
  
  const deleteQuestion = (index) => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions.splice(index, 1);
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });
    setMessage('Question deleted successfully!');
    setTimeout(() => setMessage(''), 3000);
  };
  
  const clearAllQuestions = () => {
    // Show confirmation dialog before clearing all questions
    if (quizData.questions.length === 0) {
      setMessage('No questions to clear.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    if (window.confirm(`Are you sure you want to clear all ${quizData.questions.length} questions? This action cannot be undone.`)) {
      setQuizData({
        ...quizData,
        questions: []
      });
      setMessage('All questions cleared successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  const loadQuizByCode = async () => {
    if (!quizCode.trim()) {
      setMessage('Please enter a quiz code');
      return;
    }
    
    try {
      setIsLoadingQuiz(true);
      setMessage('Loading quiz...');
      
      const response = await axiosApi.get(`/quiz/${quizCode}/load`);
      const quiz = response.data;
      
      // Convert server format to client format for questions using utility function
      const formattedQuestions = formatQuestionsFromServer(quiz.questions);
      
      // Update the quiz data with the loaded quiz
      setQuizData({
        title: quiz.title,
        startTime: new Date(quiz.startTime).toISOString().slice(0, 16), // Format for datetime-local input
        duration: quiz.duration,
        isPrivate: quiz.isPrivate || false, // Load isPrivate status or default to false
        questions: formattedQuestions
      });
      
      setMessage(`Quiz "${quiz.title}" loaded successfully!`);
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      setQuizCode(''); 
      console.error('Error loading quiz:', error);
      setMessage(error.response?.data?.message || 'Failed to load quiz. Please check the code and try again.');

    } finally {
      setIsLoadingQuiz(false);
    }
  };
  
  const generateQuiz = async () => {
    // Validate input
    if (!aiPrompt.trim()) {
      setModalError('Please enter a prompt for quiz generation');
      return;
    }

    try {
      setIsGenerating(true);
      setModalError('');
      
      // Call the server API to generate questions
      const response = await axiosApi.post('/quiz/generate', {
        prompt: aiPrompt,
        count: numQuestions
      });

      if (response.data && response.data.questions && response.data.questions.length > 0) {
        // Format the questions using utility function
        const formattedQuestions = formatQuestionsFromServer(response.data.questions);
        
        // Keep existing questions and add the newly generated ones
        const existingQuestions = [...quizData.questions];
        const updatedQuestions = [...existingQuestions, ...formattedQuestions];
        
        // Update quiz data with both existing and new questions
        setQuizData({
          ...quizData,
          questions: updatedQuestions
        });
        
        // Close the generate modal and show success message
        closeGenerateModal();
        setMessage(`${formattedQuestions.length} new questions added to your quiz!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setModalError('No questions were generated. Please try a different prompt.');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      setModalError(error.response?.data?.message || 'Failed to generate questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addQuestion = () => {
    // Clear previous errors
    setModalError('');
    
    // Validate the question using utility function
    const error = validateQuestion(currentQuestion);
    if (error) {
      setModalError(error);
      return;
    }

    let updatedQuestions = [...quizData.questions];
    
    if (editingQuestionIndex >= 0) {
      // Update existing question
      updatedQuestions[editingQuestionIndex] = { ...currentQuestion };
    } else {
      // Add new question
      updatedQuestions = [...updatedQuestions, { ...currentQuestion }];
    }
    
    const successMessage = 'Question saved successfully!';

    // Update quiz data with new/updated question
    setQuizData({
      ...quizData,
      questions: updatedQuestions
    });

    // Reset current question form
    setCurrentQuestion({
      question: '',
      options: [],
      explanation: ''
    });

    // Reset editing index
    setEditingQuestionIndex(-1);

    // Hide modal and show success message
    setShowQuestionModal(false);
    setMessage(successMessage);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (quizData.questions.length === 0) {
      setMessage('Please add at least one question to the quiz');
      return;
    }

    // Format questions for the server using utility function
    const formattedQuestions = formatQuestionsForServer(quizData.questions);

    try {
      // Check if we're editing an existing quiz or creating a new one
      let response;
      const quizPayload = {
        title: quizData.title,
        startTime: new Date(quizData.startTime),
        duration: parseInt(quizData.duration),
        questions: formattedQuestions,
        isPrivate: quizData.isPrivate,
        aiprompt: '' // Empty string as it's not being used for manual questions
      };
      
      if (quizCode.trim()) {
        // Update existing quiz
        response = await axiosApi.put(`/quiz/${quizCode}`, quizPayload);
        setCreatedQuizCode(quizCode);
        setShowSuccessMessage('Quiz updated successfully!');
      } else {
        // Create new quiz
        response = await axiosApi.post('/quiz/create', quizPayload);
        setCreatedQuizCode(response.data.quiz.code);
        setShowSuccessMessage('Quiz created successfully!');
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to save quiz', 'error');
    }
  };

  return (
    <div className="quiz-creator">
      <h1>Create Quiz</h1>
      
      {message && <InfoMessage message={message} />}
      
      {showSuccessMessage && (
        <SuccessMessage 
          message={showSuccessMessage}
          quizTitle={quizData.title}
          quizCode={createdQuizCode}
          onNavigate={() => navigate(`/quiz/${createdQuizCode}`)}
        />
      )}

      <div className="quiz-columns">
        {/* Left column - Quiz form */}
        <div className="quiz-form-column">
          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
              <label htmlFor="title">Quiz Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={quizData.title}
                onChange={handleQuizChange}
                required
                placeholder="Enter a title for your quiz"
              />
            </div>

            <div className="form-group">
              <label htmlFor="startTime">Start Date and Time</label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={quizData.startTime}
                onChange={handleQuizChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={quizData.duration}
                onChange={handleQuizChange}
                min="1"
                required
              />
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="isPrivate"
                name="isPrivate"
                checked={quizData.isPrivate}
                onChange={(e) => setQuizData({...quizData, isPrivate: e.target.checked})}
              />
              <label htmlFor="isPrivate">Make quiz private</label>
            </div>
            
            <div className="form-group quiz-code-section">
              <div className="quiz-code-input">
                <label htmlFor="quizCode">Quiz Code (to edit existing quiz)</label>
                <input
                  type="text"
                  id="quizCode"
                  value={quizCode}
                  onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                />
              </div>
              <button
                type="button"
                onClick={loadQuizByCode}
                disabled={isLoadingQuiz || !quizCode.trim()}
                className={`btn ${quizCode.trim() ? 'btn-success' : 'btn-secondary'} load-btn`}
              >
                {isLoadingQuiz ? 'Loading...' : 'Load Quiz'}
              </button>
            </div>

            <div className="button-group">
              <button 
                type="button" 
                onClick={openQuestionModal}
                className="btn btn-primary"
              >
                Add Question
              </button>
              <button 
                type="button" 
                onClick={openGenerateModal}
                className="btn btn-primary"
              >
                Generate Quiz
              </button>
              {quizData.questions.length !== 0 && (
                <button
                  type="button"
                  onClick={clearAllQuestions}
                  className="btn btn-danger"
                >
                  Clear All Questions
                </button>
              )}
            </div>

            <hr />

            <div className="button-group">
              <button type="submit" className="btn btn-success">
                {quizCode.trim() ? 'Update Quiz' : 'Create Quiz'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate(-1)} 
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Right column - Question preview */}
        <div className="quiz-preview-column">
          <div className="preview-container">
            <div className="preview-header">
              <h2>Questions Preview</h2>
              <span className="question-count">{quizData.questions.length}</span>
            </div>
            
            <QuestionsList 
              questions={quizData.questions}
              onEditQuestion={editQuestion}
              onDeleteQuestion={deleteQuestion}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <QuestionModal 
        show={showQuestionModal}
        onClose={closeQuestionModal}
        currentQuestion={currentQuestion}
        handleQuestionChange={handleQuestionChange}
        handleOptionChange={handleOptionChange}
        toggleCorrectAnswer={toggleCorrectAnswer}
        addOption={addOption}
        removeOption={removeOption}
        addQuestion={addQuestion}
        modalError={modalError}
      />
      
      <GenerateModal 
        show={showGenerateModal}
        onClose={closeGenerateModal}
        aiPrompt={aiPrompt}
        setAiPrompt={setAiPrompt}
        numQuestions={numQuestions}
        setNumQuestions={setNumQuestions}
        generateQuiz={generateQuiz}
        isGenerating={isGenerating}
        modalError={modalError}
      />
    </div>
  );
};

export default CreateQuiz;