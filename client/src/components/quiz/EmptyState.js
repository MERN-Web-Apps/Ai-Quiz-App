import React from 'react';
import '../../styles/QuestionComponents.css';

const EmptyState = ({ message, submessage }) => {
  return (
    <div className="empty-state">
      <p>{message}</p>
      <p>{submessage}</p>
    </div>
  );
};

export default EmptyState;