import React from 'react';
import '../../styles/QuestionComponents.css';

const QuestionCard = ({ question, index, onEdit, onDelete }) => {
  return (
    <div className="question-card">
      <div className="question-header">
        <h3 className="question-title">Question {index + 1}</h3>
        <div className="question-actions">
          <button 
            type="button" 
            onClick={() => onEdit(index)}
            className="btn btn-secondary"
          >
            Edit
          </button>
          <button 
            type="button" 
            onClick={() => onDelete(index)}
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
      </div>
      
      <p className="question-text">{question.question}</p>
      
      <div className="question-options">
        {question.options.map((opt, i) => (
          <div key={i} className={`question-option ${opt.isCorrect ? 'correct' : ''}`}>
            <span className="option-letter">{String.fromCharCode(65 + i)}.</span>
            <span className="option-content">{opt.text}</span>
            {opt.isCorrect && <span className="correct-label">Correct</span>}
          </div>
        ))}
      </div>
      
      <p className="answers-summary">
        Correct Answers: {question.options
          .map((opt, idx) => opt.isCorrect ? <span key={idx} className="answer-letter">{String.fromCharCode(65 + idx)}</span> : null)
          .filter(Boolean)}
      </p>
      
      {question.explanation && (
        <div className="explanation">
          <span className="explanation-title">Explanation:</span> 
          {question.explanation}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
