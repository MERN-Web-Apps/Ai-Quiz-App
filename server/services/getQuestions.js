const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const AI_API_KEY= process.env.AI_API_KEY;
const genAI = new GoogleGenerativeAI(AI_API_KEY);

const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Generate quiz questions directly in database-compatible format
async function getQuestionsFromPrompt(prompt, numberOfQuestions = 7) {
  try {
    // Construct a detailed prompt for the AI to generate questions in JSON format
    const systemPrompt = `
      You are an expert quiz creator. Based on the following topic description, generate exactly ${numberOfQuestions} multiple-choice questions.
      
      For each question:
      1. Create a clear, concise question
      2. Provide exactly 4 answer options labeled as A, B, C, and D
      3. The answer field should contain ALL correct option letters separated by commas (can be multiple correct answers like "A,C" or a single answer like "B")
      4. Include a brief explanation for why the selected answers are correct
      
      Your response must be valid JSON that matches this exact structure:
      
      [
        {
          "question": "Question text here?",
          "options": [
            "First option text",
            "Second option text",
            "Third option text", 
            "Fourth option text"
          ],
          "answer": "A,C",
          "explanation": "Brief explanation why options A and C are correct"
        },
        ... (more questions)
      ]
      
      IMPORTANT REQUIREMENTS:
      - Exactly ${numberOfQuestions} questions
      - Exactly 4 options per question
      - At least 50% of questions should have multiple correct answers (2-3 correct options)
      - The "answer" field must contain comma-separated letters (e.g., "A", "B,D", "A,C,D")
      - Include explanation for each question
      - Ensure your response is valid JSON - no markdown formatting or text before/after the JSON array
    `;

    // Combine system prompt with user's topic description
    const fullPrompt = `${systemPrompt}\n\nTopic description: ${prompt}`;
    
    // Generate content from the AI
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Find JSON in the response
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("Failed to generate valid JSON response");
    }
    
    const jsonString = text.substring(jsonStart, jsonEnd);
    
    try {
      // Parse the JSON and process the questions
      const questions = JSON.parse(jsonString);
      
      // Process answers to ensure they're in the correct format (A, B, C, D)
      processAnswers(questions);
      
      // Validate the structure
      validateQuestions(questions, numberOfQuestions);
      
      return questions;
    } catch (error) {
      console.error("Error parsing JSON:", error);
      throw new Error("Failed to parse quiz questions. Invalid JSON format received.");
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    throw new Error("Failed to generate quiz questions. Please try again with a more specific topic description.");
  }
}

// Validate the questions match our expected format
// Process answers to ensure they're in the correct format (A,B,C,D with commas for multiple)
function processAnswers(questions) {
  questions.forEach((q) => {
    // Check if the answer is already in the correct format (comma-separated letters)
    if (!/^[A-D](,[A-D])*$/.test(q.answer)) {
      // If it's a single letter without comma, that's fine
      if (/^[A-D]$/.test(q.answer)) {
        // Already correct format for a single answer
        return;
      }
      
      try {
        // Try to handle array-like answers that might have been generated
        let correctAnswers = [];
        
        // Case 1: Answer is a JSON array string like '["A", "C"]'
        if (q.answer.startsWith('[') && q.answer.endsWith(']')) {
          try {
            const parsed = JSON.parse(q.answer);
            if (Array.isArray(parsed)) {
              correctAnswers = parsed.filter(a => /^[A-D]$/.test(a));
            }
          } catch (e) {
            // Not valid JSON, continue to other checks
          }
        }
        
        // Case 2: Text description like "options A and C" or "A, C"
        if (correctAnswers.length === 0) {
          const letters = q.answer.match(/[A-D]/g);
          if (letters && letters.length > 0) {
            correctAnswers = [...new Set(letters)]; // Remove duplicates
          }
        }
        
        // Case 3: Indices or content-based matching
        if (correctAnswers.length === 0) {
          // Try to match by content
          q.options.forEach((opt, idx) => {
            if (q.answer.includes(opt)) {
              correctAnswers.push(String.fromCharCode(65 + idx));
            }
          });
        }
        
        // If we found valid answers, use them
        if (correctAnswers.length > 0) {
          q.answer = correctAnswers.join(',');
        } else {
          // Default to first option if we couldn't determine the answer
          console.warn(`Couldn't parse answer "${q.answer}", defaulting to A`);
          q.answer = 'A';
        }
      } catch (error) {
        console.warn(`Error processing answer "${q.answer}", defaulting to A`);
        q.answer = 'A';
      }
    }
  });
}

function validateQuestions(questions, expectedCount) {
  if (!Array.isArray(questions)) {
    throw new Error("Questions must be an array");
  }
  
  if (questions.length < Math.min(expectedCount, 5) || questions.length > Math.max(expectedCount, 10)) {
    console.warn(`Expected ${expectedCount} questions but got ${questions.length}`);
  }
  
  questions.forEach((q, i) => {
    // Check question has all required fields
    if (!q.question || typeof q.question !== 'string') {
      throw new Error(`Question ${i+1} is missing a valid question text`);
    }
    
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${i+1} must have exactly 4 options`);
    }
    
    if (!q.answer || typeof q.answer !== 'string') {
      throw new Error(`Question ${i+1} is missing a valid answer`);
    }
    
    if (!q.explanation || typeof q.explanation !== 'string') {
      throw new Error(`Question ${i+1} is missing an explanation`);
    }
    
    // Check that the answer format is valid - can be a single letter or comma-separated letters
    const validAnswerFormat = /^[A-D](,[A-D])*$/;
    if (!validAnswerFormat.test(q.answer)) {
      throw new Error(`Question ${i+1}'s answer must be comma-separated letters (e.g., "A", "B,D", "A,C,D")`);
    }
    
    // Validate all individual answer letters
    const answerLetters = q.answer.split(',');
    answerLetters.forEach(letter => {
      const answerIndex = letter.charCodeAt(0) - 65; // Convert A to 0, B to 1, etc.
      if (answerIndex < 0 || answerIndex >= q.options.length) {
        throw new Error(`Question ${i+1}'s answer letter "${letter}" doesn't match an available option`);
      }
    });
    
    // Check that all options are strings
    q.options.forEach((opt, j) => {
      if (typeof opt !== 'string') {
        throw new Error(`Option ${j+1} in question ${i+1} must be a string`);
      }
    });
  });
}

module.exports = { getQuestionsFromPrompt };