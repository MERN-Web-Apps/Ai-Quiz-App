const {model, Schema} = require('mongoose');
const {generateToken} = require('../services/auth');
const {createHmac, randomBytes} = require('crypto');

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  secret: { type: String },
  password: { type: String, required: true },
  profileImage: { type: String, default: 'default.jpeg' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  quizzes: [{
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    rank: { type: Number },
    score: { type: Number },
    timeTaken: { type: Number } // time in seconds
  }]
}, { timestamps: true });

userSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    this.secret = randomBytes(16).toString();
    this.password = createHmac('sha256', this.secret)
      .update(this.password)
      .digest('hex');
  }
  next();
});

userSchema.static("matchPasswordAndGenerateToken", async function(email, password) {
    const user = await this.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }
    const hashed = createHmac('sha256', user.secret)
        .update(password)
        .digest('hex');
    if(hashed !== user.password) {
        throw new Error('Invalid password');
    }
    const token = generateToken(user);
    return token;
});

userSchema.methods.comparePassword = async function(password) {
    const hashed = createHmac('sha256', this.secret)
        .update(password)
        .digest('hex');
    return hashed === this.password;
};
const User = model('User', userSchema);

module.exports = User;