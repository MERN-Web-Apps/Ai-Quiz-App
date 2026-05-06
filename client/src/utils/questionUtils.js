// Format questions from server to client format
export const formatQuestionsFromServer = (questions) => {
  return questions.map(q => {
    // The server format can be either:
    // 1. Letter codes like "A,B,C" (from AI-generated questions)
    // 2. Answer texts like "Paris, London" (from manually created questions)
    let correctOptions = [];
    
    // First, try to identify if we have letter codes (A,B,C,D)
    const potentialLetterCodes = q.answer.split(',').map(a => a.trim());
    const hasLetterCodes = potentialLetterCodes.every(code => /^[A-D]$/.test(code));
    
    if (hasLetterCodes) {
      // Case 1: We have letter codes like "A,B,C"
      correctOptions = potentialLetterCodes;
    } else {
      // Case 2: We have answer texts like "Paris, London"
      // We need to find which option text matches these answers
      const answerTexts = q.answer.split(',').map(a => a.trim());
      // For each option, check if its text is in the answer list
      correctOptions = q.options
        .map((text, idx) => answerTexts.includes(text) ? String.fromCharCode(65 + idx) : null)
        .filter(Boolean);
    }
    
    return {
      question: q.question,
      options: q.options.map((optText, idx) => {
        // Check if this option is correct using its letter (A, B, C, D)
        const optionLetter = String.fromCharCode(65 + idx);
        return {
          text: optText,
          isCorrect: correctOptions.includes(optionLetter)
        };
      }),
      explanation: q.explanation || ''
    };
  });
};

// Format questions from client to server format
export const formatQuestionsForServer = (questions) => {
  return questions.map(q => {
    // Get the correct answers as an array of option texts
    const correctAnswers = q.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt.text);
    
    return {
      question: q.question,
      options: q.options.map(opt => opt.text),
      answer: correctAnswers.join(', '), // Join multiple answers with comma
      explanation: q.explanation || ''
    };
  });
};

// Validate question before adding
export const validateQuestion = (question) => {
  if (!question.question.trim()) {
    return 'Question text is required';
  }

  if (question.options.length < 2) {
    return 'At least two options are required';
  }
  
  // Check for empty options
  const emptyOptionIndex = question.options.findIndex(opt => !opt.text.trim());
  if (emptyOptionIndex !== -1) {
    return `Option ${String.fromCharCode(65 + emptyOptionIndex)} cannot be empty`;
  }

  if (!question.options.some(opt => opt.isCorrect)) {
    return 'At least one correct answer must be selected';
  }

  return ''; // No errors
};
