const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/imgs', express.static(path.join(__dirname, 'public', 'imgs')));
app.get ('/', (req, res) => {
  res.send('Welcome to the Quiz App!');
});
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp';
mongoose.connect(MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

app.use("/user", userRoutes);
app.use("/profile", profileRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
