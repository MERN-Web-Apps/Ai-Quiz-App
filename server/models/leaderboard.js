const {model, Schema} = require('mongoose');

const leaderboardSchema = new Schema({
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  rankings: [{
    user: { type: String, required: true },
    score: { type: Number, required: true },
    timetaken: { type: Number, required: true } // time in seconds
  }]
}, { timestamps: true });

const Leaderboard = model('Leaderboard', leaderboardSchema);

module.exports = Leaderboard;
