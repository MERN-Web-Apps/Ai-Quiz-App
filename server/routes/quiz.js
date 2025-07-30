const {Router} = require('express');
const Quiz = require('../models/quiz');
const authMiddleware = require('../middleWares/auth');
const router = Router();

router.use(authMiddleware("token"));

router.post('/create', async(req, res) => {
  try {
    const {title, aiprompt, startTime, duration, isPrivate} = req.body;
    console.log(req.user);
    const quiz = await Quiz.create({
      title,
      owner: req.user.id,
      aiprompt,
      startTime,
      duration,
      questions: [],
      isPrivate
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

// Get quiz by code
router.get('/code/:code', async(req, res) => {
  try {
    const { code } = req.params;
    const quiz = await Quiz.findOne({ code: code.toUpperCase() })
      .populate('owner', 'username');
    
    if (!quiz) {
      return res.status(404).json({message: 'Quiz not found'});
    }
    
    // Check if quiz has started
    const now = new Date();
    const quizStart = new Date(quiz.startTime);
    
    if (now < quizStart) {
      return res.status(400).json({
        message: 'Quiz has not started yet',
        startTime: quiz.startTime
      });
    }
    
    res.status(200).json({
      message: 'Quiz found',
      quiz
    });
  } catch (err) {
    res.status(500).json({message: 'Error fetching quiz', error: err.message});
  }
});

// Get quiz details for taking (without answers)
router.get('/:code', async(req, res) => {
  try {
    const { code } = req.params;
    const quiz = await Quiz.findOne({ code: code.toUpperCase() })
      .populate('owner', 'username');
    
    if (!quiz) {
      return res.status(404).json({message: 'Quiz not found'});
    }
    
    // Check if quiz has started
    const now = new Date();
    const quizStart = new Date(quiz.startTime);
    const quizEnd = new Date(quizStart.getTime() + quiz.duration * 60000);
    
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
    
    res.status(200).json({
      message: 'Quiz data fetched successfully',
      quiz: quizData
    });
  } catch (err) {
    res.status(500).json({message: 'Error fetching quiz', error: err.message});
  }
});


module.exports = router;
