const {Router} = require('express');
const Quiz = require('../models/quiz');
const authMiddleware = require('../middleWares/auth');
const router = Router();
const { getQuestionsFromPrompt } = require('../services/getQuestions');

router.use(authMiddleware("token"));
router.post('/generate', async (req, res) => {
  try {
    const { prompt, count } = req.body;
    const questions = await getQuestionsFromPrompt(prompt, count);
    res.status(200).json({ questions });
  } catch (err) {
    res.status(400).json({ message: 'Error generating questions', error: err.message });
  }
});
router.post('/create', async(req, res) => {
  try {
    const {title, startTime, duration, questions, isPrivate, aiprompt} = req.body;
    const quiz = await Quiz.create({
      title,
      owner: req.user.id,
      startTime,
      duration,
      questions,
      isPrivate,
      aiprompt: aiprompt || ''
    });
    res.status(201).json({message: 'Quiz created successfully', quiz});
  } catch (err) {
    res.status(400).json({message: 'Error creating quiz', error: err.message});
  }
});

// Get recent public quizzes
router.get('/recent', async(req, res) => {
  try {
    const recentQuizzes = await Quiz.find({ 
      isPrivate: false,
      startTime: { $gte: new Date() } // Only future quizzes
    })
    .populate('owner', 'username')
    .sort({ createdAt: -1 })
    .limit(7);
    
    res.status(200).json({
      message: 'Recent quizzes fetched successfully',
      quizzes: recentQuizzes
    });
  } catch (err) {
    res.status(500).json({message: 'Error fetching recent quizzes', error: err.message});
  }
});

// Submit quiz answers or get results
router.post('/:code/submit', async (req, res) => {
  try {
    const { code } = req.params;
    const { answers, getResults } = req.body; // getResults flag for fetching results only
    
    const quiz = await Quiz.findOne({ code: code.toUpperCase() });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    const now = new Date();
    const quizStart = new Date(quiz.startTime);
    const quizEnd = new Date(quizStart.getTime() + quiz.duration * 60000);
    const hasEnded = now > quizEnd;
    
    // If this is just a results request and quiz hasn't ended
    if (getResults && !hasEnded) {
      return res.status(400).json({ 
        message: 'Quiz has not ended yet. Please wait for the quiz to complete.',
        quizEndTime: quizEnd
      });
    }
    
    // Parse answers (could be from request body or query for results)
    let userAnswers = answers || [];
    
    // Calculate score and prepare results
    let score = 0;
    const totalQuestions = quiz.questions.length;
    const results = quiz.questions.map(question => {
      const userAnswer = userAnswers.find(ans => ans.questionId === question._id.toString());
      const isCorrect = userAnswer && userAnswer.selectedOption === question.answer;
      
      if (isCorrect) {
        score++;
      }
      
      return {
        questionId: question._id,
        question: question.question,
        options: question.options,
        correctAnswer: question.answer,
        userAnswer: userAnswer ? userAnswer.selectedOption : null,
        isCorrect,
        explanation: question.explanation
      };
    });
    
    const percentage = Math.round((score / totalQuestions) * 100);
    
    if (hasEnded || getResults) {
      // Quiz has ended, show full results
      res.status(200).json({
        message: getResults ? 'Quiz results retrieved successfully' : 'Quiz submitted successfully',
        hasEnded: true,
        score,
        totalQuestions,
        percentage,
        results,
        quizTitle: quiz.title,
        quizEndTime: quizEnd
      });
    } else {
      // Quiz is still ongoing, just confirm submission
      res.status(200).json({
        message: 'Quiz submitted successfully! Please wait for the quiz to end to see your score and detailed results.',
        hasEnded: false,
        submissionTime: now,
        quizEndTime: quizEnd,
        quizTitle: quiz.title
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error processing quiz submission', error: err.message });
  }
});

// Update quiz (for owner only)
router.put('/:code', async (req, res) => {
  try {
    const { title, startTime, duration, questions, isPrivate, aiprompt } = req.body;
    const quiz = await Quiz.findOneAndUpdate(
      { code: req.params.code },
      { title, startTime, duration, questions, isPrivate, aiprompt: aiprompt || '' },
      { new: true }
    );
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json({ message: 'Quiz updated successfully', quiz });
  } catch (err) {
    res.status(400).json({ message: 'Error updating quiz', error: err.message });
  }
});
// Get quiz by code with different modes: info, take, edit (MUST BE LAST due to generic /:code pattern)
router.get('/:code', async(req, res) => {
  try {
    const { code } = req.params;
    const { mode } = req.query; // 'info', 'take', 'edit'
    
    const quiz = await Quiz.findOne({ code: code.toUpperCase() })
      .populate('owner', 'username');
    
    if (!quiz) {
      return res.status(404).json({message: 'Quiz not found'});
    }
    
    const now = new Date();
    const quizStart = new Date(quiz.startTime);
    const quizEnd = new Date(quizStart.getTime() + quiz.duration * 60000);
    
    switch (mode) {
      case 'take':
        // Check timing and remove answers for taking quiz
        if (now < quizStart) {
          return res.status(400).json({
            message: 'Quiz has not started yet',
            startTime: quiz.startTime
          });
        }
        
        if (now > quizEnd) {
          return res.status(400).json({
            message: 'Quiz has ended',
            endTime: quizEnd
          });
        }
        
        // Remove correct answers from questions
        const questionsWithoutAnswers = quiz.questions.map(q => ({
          question: q.question,
          options: q.options,
          _id: q._id
        }));
        
        const quizData = {
          _id: quiz._id,
          title: quiz.title,
          code: quiz.code,
          duration: quiz.duration,
          startTime: quiz.startTime,
          questions: questionsWithoutAnswers,
          owner: quiz.owner
        };
        
        return res.status(200).json({
          message: 'Quiz data fetched successfully',
          quiz: quizData
        });
        
      case 'edit':
        // Check ownership for editing
        if (quiz.owner._id.toString() !== req.user.id) {
          return res.status(403).json({ message: 'You do not have permission to access this quiz' });
        }
        return res.status(200).json(quiz);
        
      default:
        // Default mode: 'info' - return basic quiz info without timing checks
        return res.status(200).json({
          message: 'Quiz found',
          quiz
        });
    }
  } catch (err) {
    res.status(500).json({message: 'Error fetching quiz', error: err.message});
  }
});

module.exports = router;
