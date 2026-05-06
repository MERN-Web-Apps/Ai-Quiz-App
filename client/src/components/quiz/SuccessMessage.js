import React from 'react';

const SuccessMessage = ({ message, quizTitle, quizCode, onNavigate }) => {
  return (
    <div className="success-message">
      <div>Quiz <strong>{quizTitle}</strong> was created successfully with code: <strong>{quizCode}</strong></div>
      <button 
        onClick={onNavigate}
        className="btn btn-primary"
      >
        Go to Quiz
      </button>
    </div>
  );
};

export default SuccessMessage;
