function getQuestionsFromPrompt(prompt) {
  // This function should implement the logic to generate questions from the AI prompt
  // For now, we will return some sample questions based on the prompt
  
  // Sample questions for testing
  const sampleQuestions = [
    {
      question: "What is the capital of France?",
      options: ["London", "Berlin", "Paris", "Madrid"],
      answer: "Paris"
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      answer: "Mars"
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      answer: "4"
    },
    {
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
      answer: "William Shakespeare"
    },
    {
      question: "What is the largest mammal in the world?",
      options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
      answer: "Blue Whale"
    }
  ];
  
  // Return first 3-5 questions for testing
  const numQuestions = Math.min(Math.floor(Math.random() * 3) + 3, sampleQuestions.length);
  return sampleQuestions.slice(0, numQuestions);
}

module.exports = { getQuestionsFromPrompt };