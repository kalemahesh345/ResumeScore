# ResumeAI — AI-Powered Resume Analyzer & ATS Score Checker

ResumeAI is a modern, responsive full-stack web application designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS). Powered by Google Gemini AI (gemini-1.5-flash) and built using React.js with Tailwind CSS, Node.js with Express, and MongoDB.

---

## Key Features

- **User Authentication:** Secure signup/signin using JWT and bcrypt password encryption.
- **ATS Scoring:** Instantly calculates an ATS compatibility score from 0 to 100.
- **Detailed Audit:**
  - **Key Strengths:** Identifies what your resume does well.
  - **Missing Skills:** Discovers essential professional skills that should be added.
  - **Missing Keywords:** Finds standard search keywords for ATS filters.
  - **Actionable Tips:** Step-by-step formatting and layout improvement advice.
- **User Dashboard:** Tracks total scans, highest score, score growth progress, and historical resume logs.
- **Export Reports:** Clean, print-friendly layout to download reports as PDF.
- **Robust Fallbacks:**
  - **In-Memory Mock Database Mode:** If MongoDB is not running locally, the server automatically boots up in mock DB mode. You can register, log in, upload, and delete history with zero setup!
  - **Mock Analysis Fallback:** If a Gemini API Key is not configured, the service utilizes a local heuristic text analyzer to generate a realistic score report instantly.

---

## Tech Stack

- **Frontend:** React.js, React Router DOM, Tailwind CSS (v4), Axios, Lucide React
- **Backend:** Node.js, Express.js, Multer (file upload), pdf-parse (PDF text extraction)
- **Database:** MongoDB (via Mongoose)
- **AI Integration:** Google Gemini API SDK (`@google/generative-ai`)

---

## Project Structure

```
c:/Users/Kale Mahesh/OneDrive/Desktop/Resume-Analyser/
├── Front-end/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── api/                   # Axios setup
│   │   ├── components/            # ScoreCircle, Navbar, ResumeCard, ProtectedRoute
│   │   ├── pages/                 # Landing, Login, Register, Dashboard, Upload, Result
│   │   ├── App.jsx                # Router & central layout
│   │   └── index.css              # Tailwind directives & CSS config
│
└── Back-end/                      # Express Backend
    ├── config/                    # db.js (mongoose connection) & mockStore.js
    ├── controllers/               # Auth and Resume route handlers
    ├── middleware/                # JWT verification middleware
    ├── models/                    # Mongoose Schemas (User, Resume, Result)
    ├── routes/                    # API endpoints
    ├── services/                  # Gemini AI service integration
    └── index.js                   # Application entrypoint
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Optional - if you want local persistence, otherwise it runs in-memory!)

### 1. Run the Backend Server

1. Navigate to the Back-end folder:
   ```bash
   cd Back-end
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   - Create a `.env` file from the template:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your keys (optional):
     ```env
     PORT=5000
     MONGO_URI=mongodb+srv://...  # Leave empty to use local MongoDB or In-Memory Mock DB
     JWT_SECRET=some_secret_key
     GEMINI_API_KEY=your_gemini_key # Leave empty to use local Heuristic Mock Analysis
     ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
   *The server will start listening at `http://localhost:5000`.*

### 2. Run the Frontend Client

1. Navigate to the Front-end folder:
   ```bash
   cd Front-end
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will run at `http://localhost:5173`.*

---

## API Endpoints

### Auth Routes
- `POST   /api/auth/register` → Register new user.
- `POST   /api/auth/login`    → User login, returns JWT token.
- `GET    /api/auth/me`       → Get logged in user details.

### Resume Routes
- `POST   /api/resume/upload`     → Upload PDF & trigger AI analysis.
- `GET    /api/resume/all`        → Retrieve history logs.
- `GET    /api/resume/result/:id` → Retrieve specific score report.
- `DELETE /api/resume/:id`        → Delete a report from history.
