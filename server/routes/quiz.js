const {Router} = require('express');
const Quiz = require('../models/quiz');
const authMiddleware = require('../middleWares/auth');
const router = Router();

router.use(authMiddleware("token"));

router.post('/create', async(req, res) => {
  try {
    const {title, code, aiprompt, startTime, duration, questions} = req.body;
    const quiz = await Quiz.create({
      title,
      owner: req.user.username,
      code,
      aiprompt,
      startTime,
      duration,
      questions
    });
    res.status(201).json({message: 'Quiz created successfully', quiz});
  } catch (err) {
    res.status(400).json({message: 'Error creating quiz', error: err.message});
  }
});


module.exports = router;
