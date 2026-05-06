const {model, Schema} = require('mongoose');

const leaderboardSchema = new Schema({
  quizCode: { type: String, required: true },
  rankings: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    timetaken: { type: Number, required: true } // time in seconds
  }]
}, { timestamps: true });

const Leaderboard = model('Leaderboard', leaderboardSchema);

module.exports = Leaderboard;
