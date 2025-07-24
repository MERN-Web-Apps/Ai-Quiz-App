const {model, Schema} = require('mongoose');

const quizSchema = new Schema({
  title: { type: String, required: true },
  owner: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  aiprompt: { type: String, required: true },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // duration in minutes
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: String, required: true }
  }]
}, { timestamps: true });

const Quiz = model('Quiz', quizSchema);

module.exports = Quiz;
