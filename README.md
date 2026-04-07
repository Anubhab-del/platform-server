# Platform-Server

Backend for **LearnPro**, a full-stack online learning platform that provides APIs for authentication, course management, enrollment, Stripe payments, progress tracking, and dashboard features.

---

## Features

- JWT-based authentication
- Secure password hashing with bcrypt
- Course listing and course detail APIs
- Search, sorting, filtering, and pagination
- Free and paid course enrollment
- Stripe payment integration
- Enrollment tracking
- Lesson progress tracking
- Course completion updates
- Protected routes using authentication middleware
- MongoDB integration with Mongoose
- Seed script for demo courses and user

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Stripe
- dotenv
- cors
- helmet
- morgan

---

## Project Structure

```bash
platform-server/
├── controllers/
├── middleware/
├── models/
├── routes/
├── server.js
├── seed.js
├── package.json
└── .env
Environment Variables
Create a .env file in the root of the backend project.

Local Development
env

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=your_stripe_secret_key
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
Production
env

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=your_stripe_secret_key
GROQ_API_KEY=your_groq_api_key
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
Installation
Bash

npm install
Run Locally
Bash

npm run dev
Backend runs on:

Bash

http://localhost:5000
Start in Production
Bash

npm start
Seed the Database
To insert sample courses and a demo user:

Bash

npm run seed
This script:

clears existing course data
inserts sample course data
creates a demo user
Demo User
If seeded successfully, demo credentials are:

txt

Email: demo@learnpro.com
Password: Demo@1234
API Base URL
Bash

http://localhost:5000/api
Main Routes
Auth
Bash

/api/auth
Handles:

user registration
user login
authenticated user actions
Courses
Bash

/api/courses
Handles:

fetching all courses
fetching a single course
featured/popular/latest course queries
search, filter, sort, and pagination
Enrollment
Bash

/api/enroll
Handles:

enroll in a course
get user’s enrolled courses
check enrollment status
Progress
Bash

/api/progress
Handles:

get progress for a course
mark lessons as complete
Checkout
Bash

/api/checkout
Handles:

create Stripe payment intent
confirm payment
create paid enrollment
Chat
Bash

/api/chat
Handles AI/chat-related backend functionality.

Core Functionalities
Authentication
Users can register and log in securely.
Passwords are hashed using bcrypt, and JWT tokens are used for protected API access.

Course Search and Pagination
Courses can be searched and paginated using query parameters such as:

Bash

/api/courses?page=1&limit=9&sort=newest&search=web
Stripe Payments
For paid courses:

Backend creates a Stripe PaymentIntent
Frontend confirms payment with Stripe
Backend confirms payment and creates enrollment
Enrollment
When a user enrolls:

an enrollment document is created
a progress document is initialized
enrolled count is incremented
Progress Tracking
When a user marks a lesson complete:

lesson ID is stored in completedLessons
percentComplete is recalculated
course is marked completed when all lessons are finished
Health Check
Bash

/api/health
Use this route to confirm the backend is running correctly.

Deployment
The backend is deployed on Render.

Required Render Environment Variables
env

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=your_stripe_secret_key
GROQ_API_KEY=your_groq_api_key
NODE_ENV=production
CLIENT_URL=https://your-frontend-url.vercel.app
Notes
Stripe test cards such as 4242 4242 4242 4242 are used only in test mode
CORS is configured for local and deployed frontend URLs
MongoDB is connected using Mongoose
Protected routes require a valid JWT token
Seed data includes multiple courses across different categories
Author
Anubhab Das
