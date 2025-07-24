const {Router} = require('express');
const Leaderboard = require('../models/leaderboard');
const authMiddleware = require('../middleWares/auth');
const router = Router();

router.use(authMiddleware("token"));

router.post('/submit', async(req, res) => {
  try {
    const {quizId, score, timetaken} = req.body;
    
    let leaderboard = await Leaderboard.findOne({quiz: quizId});
    
    if (!leaderboard) {
      leaderboard = await Leaderboard.create({
        quiz: quizId,
        rankings: [{
          user: req.user.username,
          score,
          timetaken
        }]
      });
    } else {
      leaderboard.rankings.push({
        user: req.user.username,
        score,
        timetaken
      });
      await leaderboard.save();
    }
    
    res.status(201).json({message: 'Score submitted successfully', leaderboard});
  } catch (err) {
    res.status(400).json({message: 'Error submitting score', error: err.message});
  }
});

router.get('/quiz/:quizId', async(req, res) => {
  try {
    const leaderboard = await Leaderboard.findOne({quiz: req.params.quizId})
      .populate('quiz', 'title');
    
    if (!leaderboard) {
      return res.status(404).json({message: 'Leaderboard not found'});
    }
    
    // Sort rankings by score (descending) and time taken (ascending)
    leaderboard.rankings.sort((a, b) => {
      if (b.score === a.score) {
        return a.timetaken - b.timetaken;
      }
      return b.score - a.score;
    });
    
    res.json(leaderboard);
  } catch (err) {
    res.status(400).json({message: 'Error fetching leaderboard', error: err.message});
  }
});

module.exports = router;
