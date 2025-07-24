const {model, Schema, get} = require('mongoose');
const {getQuestionsFromPrompt} = require('../services/getQuestions');

const quizSchema = new Schema({
  title: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  isPrivate: { type: Boolean, default: false },
  code: { type: String, unique: true },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: String, required: true }
  }]
}, { timestamps: true });

quizSchema.pre('save', function(next) {
  this.code = Math.random().toString(36).substring(2, 8).toUpperCase(); 
  this.questions = getQuestionsFromPrompt(this.aiprompt);
  next();
});

const Quiz = model('Quiz', quizSchema);

module.exports = Quiz;
