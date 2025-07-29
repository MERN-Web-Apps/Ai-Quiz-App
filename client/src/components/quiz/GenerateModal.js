import React from 'react';
import '../../styles/QuestionComponents.css';

const GenerateModal = ({ 
  show, 
  onClose, 
  aiPrompt, 
  setAiPrompt, 
  numQuestions, 
  setNumQuestions, 
  generateQuiz, 
  isGenerating, 
  modalError 
}) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content generate-modal-content">
        <div className="question-modal-header">
          <h3 className="question-modal-title">Generate Quiz Questions</h3>
        </div>
        
        {modalError && (
          <div className="modal-error">
            {modalError}
          </div>
        )}
        
        <div className="modal-section">
          <label className="modal-section-title">Topic or Prompt:</label>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Enter a topic or detailed prompt for the AI to generate questions on (e.g., 'JavaScript basics' or 'World History focusing on World War II')"
            className="form-control prompt-textarea"
          />
        </div>
        
        <div className="generate-settings">
          <div className="number-input">
            <label>Number of Questions:</label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) => setNumQuestions(parseInt(e.target.value) || 1)}
              min="1"
              max="20"
            />
          </div>
        </div>
        
        <div className="generate-info">
          <span className="generate-info-icon">ℹ️</span>
          <p>Your existing questions will be preserved, and new generated questions will be added to them. The more specific your prompt, the better the questions will be.</p>
        </div>
        
        <div className="modal-actions">
          <button 
            type="button" 
            onClick={generateQuiz}
            disabled={isGenerating}
            className={`btn btn-success ${isGenerating ? 'disabled' : ''}`}
          >
            {isGenerating ? 'Generating...' : 'Generate Questions'}
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

export default GenerateModal;