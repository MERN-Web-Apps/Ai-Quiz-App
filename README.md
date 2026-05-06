# AI Quiz App

A full-stack web application that allows users to create, take, and share AI-generated quizzes. Built with React, Express.js, and MongoDB, powered by Google's Generative AI for automatic question generation.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Features in Detail](#features-in-detail)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Quiz Functionality

- **AI-Powered Quiz Generation**: Create quizzes with AI-generated multiple-choice questions using Google Gemini API
- **Quiz Creation**: Users can create custom quizzes with configurable titles, duration, and start times
- **Quiz Sharing**: Share quizzes via unique quiz codes (6-character alphanumeric)
- **Private/Public Quizzes**: Control quiz visibility with privacy settings
- **Quiz Taking**: Interactive quiz interface with real-time scoring
- **Answer Support**: Questions support multiple correct answers

### User Management

- **Authentication**: Multiple authentication methods
  - Email/Password signup and signin
  - Google OAuth 2.0 integration for quick login
- **User Profiles**: View user profiles with quiz history and performance stats
- **Role-Based Access**: Support for both regular users and admin roles
- **Data Security**: Password hashing using HMAC with SHA256

### Leaderboards & Analytics

- **Quiz Leaderboards**: Track top performers with scores and time taken
- **Performance Metrics**: Monitor user performance across quizzes
- **Rankings**: Real-time ranking system for quiz participants

### UI/UX Features

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Alerts**: Global alert system for user notifications
- **Chart Visualization**: Performance analytics using Chart.js
- **Modal-Based Workflows**: Clean, organized user interfaces
- **Form Validation**: Client-side validation for all inputs

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI library with modern hooks and features
- **React Router DOM 7** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Chart.js & react-chartjs-2** - Data visualization
- **react-google-button** - Google OAuth integration
- **CSS3** - Responsive styling

### Backend

- **Node.js & Express.js 5** - Server framework
- **MongoDB & Mongoose** - Database and ODM
- **Passport.js** - Authentication middleware
- **passport-google-oauth20** - Google OAuth strategy
- **Google Generative AI SDK** - AI-powered question generation
- **JWT** - Token-based authentication
- **multer** - File upload handling
- **cookie-parser** - Cookie parsing middleware

### Development Tools

- **Nodemon** - Development server auto-reload
- **Concurrently** - Run multiple npm scripts simultaneously
- **dotenv** - Environment variable management

## 📁 Project Structure

```
quiz-app/
├── client/                          # React frontend application
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   ├── config.json             # Configuration loader
│   │   └── robots.txt
│   ├── src/
│   │   ├── App.js                  # Main React component
│   │   ├── App.css
│   │   ├── index.js                # React entry point
│   │   ├── configLoader.js         # Dynamic config loader
│   │   ├── reportWebVitals.js
│   │   ├── setupTests.js
│   │   ├── apis/
│   │   │   └── getUser.js          # API calls for user data
│   │   ├── components/
│   │   │   ├── Alert.js            # Global alert component
│   │   │   ├── AlertProvider.js    # Alert context provider
│   │   │   ├── Navbar.js           # Navigation bar
│   │   │   └── quiz/               # Quiz-related components
│   │   │       ├── EmptyState.js
│   │   │       ├── GenerateModal.js       # AI question generation UI
│   │   │       ├── InfoMessage.js
│   │   │       ├── QuestionCard.js        # Single question display
│   │   │       ├── QuestionModal.js       # Question editing
│   │   │       ├── QuestionsList.js       # Quiz questions list
│   │   │       └── SuccessMessage.js
│   │   ├── pages/
│   │   │   ├── Home.js             # Landing page
│   │   │   ├── Signin.js           # Login page
│   │   │   ├── Signup.js           # Registration page
│   │   │   ├── Profile.js          # User profile page
│   │   │   ├── Create_quiz.js      # Quiz creation page
│   │   │   ├── Quiz.js             # Quiz taking interface
│   │   │   ├── leaderboard.js      # Leaderboard page
│   │   │   └── 404.js              # Not found page
│   │   ├── styles/                 # CSS stylesheets
│   │   ├── utils/
│   │   │   ├── axiosApi.js         # Axios instance with interceptors
│   │   │   └── questionUtils.js    # Utility functions for questions
│   │   └── index.css
│   └── package.json
│
├── server/                          # Express.js backend
│   ├── index.js                    # Server entry point
│   ├── middleWares/
│   │   ├── auth.js                 # JWT authentication middleware
│   │   └── googleAuth.js           # Google OAuth callback handler
│   ├── models/
│   │   ├── user.js                 # User schema and methods
│   │   ├── quiz.js                 # Quiz schema
│   │   └── leaderboard.js          # Leaderboard schema
│   ├── services/
│   │   ├── auth.js                 # JWT token generation/verification
│   │   ├── getQuestions.js         # AI question generation service
│   │   └── ...
│   ├── routes/
│   │   ├── user.js                 # User authentication routes
│   │   ├── profile.js              # User profile routes
│   │   ├── quiz.js                 # Quiz CRUD routes
│   │   └── leaderboard.js          # Leaderboard routes
│   ├── public/
│   │   └── imgs/                   # Static images
│   ├── utils/
│   │   └── ...
│   └── package.json
│
├── package.json                    # Root package.json with scripts
├── LICENSE
└── README.md                       # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance like MongoDB Atlas)
- **Google OAuth Credentials** (for authentication)
- **Google Generative AI API Key** (for quiz generation)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd quiz-app
   ```

2. **Install root dependencies**

   ```bash
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Install server dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

### Environment Configuration

Create a `.env` file in the `server` directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/quizapp
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/quizapp

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# JWT
JWT_SECRET=<your-jwt-secret-key>

# Google Generative AI
AI_API_KEY=<your-google-api-key>

# Server
PORT=4000
NODE_ENV=development
```

**How to obtain credentials:**

- **Google OAuth**: Create a project in [Google Cloud Console](https://console.cloud.google.com/), enable OAuth 2.0, and create credentials
- **Google Generative AI API**: Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **MongoDB**: Use a local MongoDB instance or create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 📖 Running the Application

### Development Mode (Full Stack)

Run both client and server with a single command:

```bash
npm start
```

This uses `concurrently` to run:

- **Client**: React development server on `http://localhost:3000`
- **Server**: Express server on `http://localhost:4000`

### Run Client Only

```bash
npm run client
```

### Run Server Only

```bash
npm run server
```

### Server Commands (from `server/` directory)

```bash
npm run dev      # Run with nodemon (auto-reload on changes)
npm start        # Run production build
npm test         # Run tests (not implemented yet)
```

### Client Commands (from `client/` directory)

```bash
npm start        # Start development server
npm build        # Create production build
npm test         # Run tests
```

## 📡 API Documentation

### Authentication Routes (`/user`)

- `POST /user/signin` - Login with email/password
- `POST /user/signup` - Register new account
- `GET /auth/google` - Google OAuth login
- `GET /auth/google/callback` - OAuth callback endpoint

### Quiz Routes (`/quiz`)

- `POST /quiz/generate` - Generate AI quiz questions
  - **Body**: `{ prompt: string, count: number }`
  - **Returns**: Array of generated questions
- `POST /quiz/create` - Create new quiz
  - **Body**: `{ title, startTime, duration, questions, isPrivate }`
- `GET /quiz/:code` - Get quiz by code
- `GET /quiz/:code/load` - Load quiz for editing (owner only)
- `PUT /quiz/:code` - Update quiz (owner only)

### Profile Routes (`/profile`)

- `GET /profile/:username` - Get user profile data
- `PUT /profile` - Update user profile
- `POST /profile/upload` - Upload profile image

### Leaderboard Routes (`/leaderboard`)

- `GET /leaderboard/:quizCode` - Get quiz leaderboard

## 🎯 Features in Detail

### Quiz Generation with AI

The app uses Google's Gemini 2.0 Flash model to generate high-quality quiz questions:

- Generates exactly the requested number of questions (default 7)
- Creates multiple-choice questions with 4 options each
- Supports multiple correct answers per question
- Provides explanations for correct answers
- Structured JSON output for easy parsing

**Example Generation Workflow:**

1. User provides a topic in the GenerateModal
2. Request sent to `/quiz/generate` endpoint
3. Google Generative AI creates questions based on the topic
4. Questions are displayed in the UI for review/editing
5. User can modify questions before creating the quiz

### User Authentication

- **Email/Password**: Traditional signup and signin with hashed passwords
- **Google OAuth**: Seamless login using Google accounts
- **JWT Tokens**: Session management with 1-hour expiration
- **Auto User Creation**: Automatic account creation on first Google login

### Quiz Workflow

**Creating a Quiz:**

1. Navigate to "Create Quiz"
2. Enter quiz title
3. Set start time and duration
4. Choose to generate questions with AI or create manually
5. Review and edit questions
6. Save the quiz

**Taking a Quiz:**

1. Find quiz via code or user profile
2. Start quiz at scheduled time
3. Answer all questions
4. Submit for scoring
5. View results and leaderboard ranking

## 🔐 Security Features

- JWT-based authentication with expiration
- Password hashing using HMAC-SHA256
- Environment variable protection for sensitive data
- CORS configuration for cross-origin requests
- Ownership verification for quiz updates
- Permission checks for quiz access

## 🏗️ Architecture Highlights

### Frontend Architecture

- **React Router**: Client-side navigation without page reloads
- **Axios Interceptors**: Automatic error handling and token refresh
- **Context API**: Global alert notifications and state management
- **Responsive CSS**: Mobile-first design approach

### Backend Architecture

- **RESTful API**: Clean endpoint design following REST principles
- **Middleware Stack**: Authentication, CORS, JSON parsing
- **Mongoose Schemas**: Data validation at the database level
- **Pre-save Hooks**: Automatic data processing (password hashing, quiz code generation)

## 🚧 Future Enhancements

- Timer countdown for quiz submissions
- Question shuffling and randomization
- Detailed performance analytics dashboard
- Batch quiz creation and management
- Question difficulty levels
- Category-based quiz filtering
- Social sharing features
- Quiz templates
- Admin dashboard for moderation

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

