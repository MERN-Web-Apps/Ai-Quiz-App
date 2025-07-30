const {model, Schema, get} = require('mongoose');

const quizSchema = new Schema({
  title: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  aiprompt: { type: String, required: false, default: '' },
  isPrivate: { type: Boolean, default: false },
  code: { type: String, unique: true },
  startTime: { type: Date, required: true },
  duration: { type: Number, required: true },
  questions: [{
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    answer: { type: String, required: true },
    explanation: { type: String, required: true }
  }]
}, { timestamps: true });

quizSchema.pre('save', async function(next) {
  if(this.isNew){
    this.code = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

const Quiz = model('Quiz', quizSchema);

module.exports = Quiz;
