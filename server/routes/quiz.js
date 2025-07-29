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
    const {title, startTime, duration, questions, isPrivate} = req.body;
    const quiz = await Quiz.create({
      title,
      owner: req.user.id,
      startTime,
      duration,
      questions,
      isPrivate
    });
    res.status(201).json({message: 'Quiz created successfully', quiz});
  } catch (err) {
    res.status(400).json({message: 'Error creating quiz', error: err.message});
  }
});

router.get('/:code', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ code: req.params.code });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(quiz);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching quiz', error: err.message });
  }
});

router.get('/:code/load', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ code: req.params.code });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    if (quiz.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to access this quiz' });
    }
    res.status(200).json(quiz);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching quiz', error: err.message });
  }
});

router.put('/:code', async (req, res) => {
  try {
    const { title, startTime, duration, questions, isPrivate } = req.body;
    const quiz = await Quiz.findOne({ code: req.params.code });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    if(quiz.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You do not have permission to update this quiz' });
    }
    quiz.title = title;
    quiz.startTime = startTime;
    quiz.duration = duration;
    quiz.questions = questions;
    quiz.isPrivate = isPrivate;
    await quiz.save();
    
    res.status(200).json({ message: 'Quiz updated successfully', quiz });
  } catch (err) {
    res.status(400).json({ message: 'Error updating quiz', error: err.message });
  }
});
module.exports = router;
