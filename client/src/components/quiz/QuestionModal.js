import React from 'react';
import '../../styles/QuestionComponents.css';

const QuestionModal = ({ 
  show, 
  onClose, 
  currentQuestion, 
  handleQuestionChange, 
  handleOptionChange, 
  toggleCorrectAnswer, 
  addOption, 
  removeOption, 
  addQuestion,
  modalError
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="question-modal-header">
          <h3 className="question-modal-title">
            {currentQuestion._id ? 'Edit Question' : 'Add Question'}
          </h3>
        </div>
        
        {modalError && (
          <div className="modal-error">
            {modalError}
          </div>
        )}
        
        <div className="modal-section">
          <label className="modal-section-title">Question Text:</label>
          <textarea
            name="question"
            value={currentQuestion.question}
            onChange={handleQuestionChange}
            placeholder="Enter your question here"
            className="form-control question-textarea"
          />
        </div>

        <div className="modal-section">
          <label className="modal-section-title">Options:</label>
          
          <div className="options-list">
            {currentQuestion.options.length === 0 && (
              <p>No options added. Click "Add Option" to add options.</p>
            )}
            
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="option-container">
                <div className="option-letter">
                  {String.fromCharCode(65 + index)}.
                </div>
                <div className="option-correct">
                  <input
                    type="checkbox"
                    checked={option.isCorrect || false}
                    onChange={() => toggleCorrectAnswer(index)}
                    id={`correct-${index}`}
                  />
                  <label htmlFor={`correct-${index}`}>Correct</label>
                </div>
                <input
                  type="text"
                  className="option-text"
                  value={option.text || ''}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                />
                <button 
                  type="button" 
                  onClick={() => removeOption(index)}
                  className="option-remove"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          <button 
            type="button" 
            onClick={addOption}
            className="add-option-button"
          >
            + Add Option
          </button>
        </div>

        {currentQuestion.options.length > 0 && (
          <div className="correct-answers-summary">
            {currentQuestion.options.some(opt => opt.isCorrect) ? (
              <p>Selected correct options: {currentQuestion.options
                .map((opt, idx) => opt.isCorrect ? String.fromCharCode(65 + idx) : null)
                .filter(Boolean)
                .join(', ')}
              </p>
            ) : (
              <p>No correct answers selected yet. Please mark at least one option as correct.</p>
            )}
          </div>
        )}

        <div className="modal-section">
          <label className="modal-section-title">Explanation (Optional):</label>
          <textarea
            name="explanation"
            value={currentQuestion.explanation}
            onChange={handleQuestionChange}
            placeholder="Provide an explanation for the correct answer"
            className="form-control explanation-textarea"
          />
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            onClick={addQuestion}
            className="btn btn-success"
          >
            Save Question
          </button>
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;