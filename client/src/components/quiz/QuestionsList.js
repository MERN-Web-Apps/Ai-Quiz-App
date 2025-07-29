import React from 'react';
import QuestionCard from './QuestionCard';
import EmptyState from './EmptyState';

const QuestionsList = ({ questions, onEditQuestion, onDeleteQuestion }) => {
  return (
    <div className="questions-list">
      {questions.length === 0 ? (
        <EmptyState 
          message="No questions added yet." 
          submessage="Click Add Question to manually create questions or Generate Quiz to create questions with AI." 
        />
      ) : (
        questions.map((question, index) => (
          <QuestionCard 
            key={index}
            question={question}
            index={index}
            onEdit={onEditQuestion}
            onDelete={onDeleteQuestion}
          />
        ))
      )}
    </div>
  );
};

export default QuestionsList;