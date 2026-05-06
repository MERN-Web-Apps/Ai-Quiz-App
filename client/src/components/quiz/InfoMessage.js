import React from 'react';

const InfoMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="info-message">
      {message}
    </div>
  );
};

export default InfoMessage;
