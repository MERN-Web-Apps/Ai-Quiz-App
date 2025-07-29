const {Router} = require('express');
const Leaderboard = require('../models/leaderboard');
const authMiddleware = require('../middleWares/auth');
const router = Router();

router.use(authMiddleware("token"));

router.get('/:quizCode', async (req, res) => {
  try {
    const leaderboard = await Leaderboard.findOne({ quizCode: req.params.quizCode }).populate('rankings.userId', 'username');
    
    if (!leaderboard) {
      return res.status(404).json({ message: 'Leaderboard not found' });
    }
    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(400).json({ message: 'Error fetching leaderboard', error: err.message });
  }
});
router.post('/:code', async (req, res) => {
  try {
    const { userId, score, timetaken } = req.body;
    const leaderboard = await Leaderboard.findOneAndUpdate(
      { quiz: req.params.code },
      { $push: { rankings: { userId, score, timetaken } } },
      { new: true, upsert: true }
    );
    res.status(201).json({ message: 'Leaderboard updated successfully', leaderboard });
  } catch (err) {
    res.status(400).json({ message: 'Error updating leaderboard', error: err.message });
  }
});
module.exports = router;
