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


module.exports = router;
