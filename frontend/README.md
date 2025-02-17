# ReadRealam

# Article Feeds Web Application

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## Introduction
The Article Feeds Web Application allows users to read, create, and manage articles from various categories like sports, politics, space, and more. Users can set their preferences to view articles that match their interests, manage their profiles, and interact with articles through likes, dislikes, and blocks.

---

## Features
- **User Authentication:** Signup, Login, and Secure Authentication.
- **Personalized Dashboard:** Users see articles based on their chosen preferences.
- **Article Management:** Create, edit, and delete personal articles.
- **User Preferences:** Modify article preferences at any time.
- **Article Interaction:** Like, dislike, or block articles.
- **Profile Management:** Update personal details and password.

---

## Tech Stack
### Frontend:
- React.js (TypeScript)
- Redux Toolkit
- Tailwind CSS
- React Router

### Backend:
- Node.js
- Express.js
- MongoDB (Mongoose ORM)
- JSON Web Token (JWT) Authentication

---

## Installation
### Prerequisites
- Node.js (v16+)
- MongoDB (Locally or Cloud)
- npm or yarn

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/ebsonjoy/ReadRealm-.git
   cd article-feeds-app
   ```
2. Install dependencies for both frontend and backend:
   ```bash
   cd client
   npm install
   cd ../server
   npm install
   ```
3. Set up environment variables (refer to the `.env.example` file).
4. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```
5. Start the frontend:
   ```bash
   cd client
   npm start
   ```
6. Open `http://localhost:3005` in the browser.

---

## Environment Variables
Create a `.env` file in the `server` directory with the following values:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

---

## Usage
1. **User Signup & Login**
   - Register with details and select article preferences.
   - Log in using email or phone.
2. **Dashboard**
   - View articles based on selected preferences.
   - Like, dislike, or block articles.
3. **Manage Articles**
   - Create new articles with title, description, category, and images.
   - Edit or delete your articles.
4. **Settings**
   - Update personal information and change password.
   - Modify article preferences.

---

## Folder Structure
```
article-feeds-app/
 ├── frontend/               # Frontend Code (React.js)
 │   ├── src/
 │   │   ├── components/  # Reusable components
 │   │   ├── pages/       # App pages
 │   │   ├── store/       # Redux state management
 │   │   ├── App.tsx
 │   │   ├── index.tsx
 │   ├── public/
 │   ├── package.json
 │   ├── tailwind.config.js
 │   └── tsconfig.json
 ├── backend/               # Backend Code (Node.js, Express.js)
 │   ├── controllers/      # Route controllers
 │   ├── models/          # Mongoose models
 │   ├── routes/          # API routes
 │   ├── middlewares/     # Middleware functions
 │   ├── config/          # Configuration files
 │   ├── server.ts        # Entry point
 │   ├── package.json
 │   └── tsconfig.json
 ├── README.md
 ├── .gitignore
 └── .env.example
```

---

## API Endpoints
### Auth Routes
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile details
- `PUT /api/auth/profile` - Update profile details
- `PUT /api/auth/preferences` - Update article preferences

### Article Routes
- `POST /api/articles` - Create an article
- `GET /api/articles` - Get all articles based on user preferences
- `GET /api/articles/:id` - Get a single article
- `PUT /api/articles/:id` - Edit an article
- `DELETE /api/articles/:id` - Delete an article

---

## License
This project is licensed under the MIT License.



This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
