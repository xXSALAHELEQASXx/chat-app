A full-stack MERN chat application with real-time messaging, AI assistant integration, and modern UI/UX design.

✨ Features

🔐 User Authentication - Secure JWT-based authentication
💬 Real-time Messaging - Instant message delivery using Socket.io
🤖 AI Assistant - Built-in AI chatbot for conversations
👥 Online Status - See who's online in real-time
🖼️ Image Sharing - Send images in conversations
📱 Responsive Design - Works seamlessly on desktop and mobile
🔔 Unseen Message Badges - Track unread messages
🔍 User Search - Find users quickly
👤 Profile Management - Update profile picture and information

🛠️ Tech Stack
Frontend

React - UI library
Tailwind CSS - Styling
React Router - Navigation
Socket.io Client - Real-time communication
React Hot Toast - Notifications
Axios - HTTP requests

Backend

Node.js & Express - Server framework
MongoDB - Database
Socket.io - WebSocket connections
JWT - Authentication
Cloudinary - Image storage
Bcrypt - Password hashing

📦 Installation
Prerequisites

Node.js (v14 or higher)
MongoDB (local or Atlas)
Cloudinary account (for image uploads)

Clone the Repository
git clone https://github.com/xXSALAHELEQASXx/chat-app.git
cd chat-app

Backend Setup
cd server
npm install

Create a .env file in the server directory:
envPORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
NODE_ENV=development

Start the backend server:
node server.js

Frontend Setup
cd client
npm install
Create a .env file in the client directory:
envVITE_BACKEND_URL=http://localhost:5000

Start the frontend:
npm run dev
The app should now be running at http://localhost:5173
🚀 Deployment
Backend Deployment (Render.com - Recommended)

Create account on Render.com
Create new Web Service
Connect your GitHub repository
Set root directory to server
Add environment variables
Deploy!

Note: Do NOT deploy the backend on Vercel - it doesn't support persistent WebSocket connections.
Frontend Deployment (Vercel)

Create account on Vercel
Import your GitHub repository
Set root directory to client
Add environment variable: VITE_BACKEND_URL=your_render_backend_url
Deploy!

📁 Project Structure
chat-app/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── assets/        # Images and icons
│   │   ├── components/    # React components
│   │   ├── context/       # Context API (Auth, Chat)
│   │   ├── lib/           # Utility functions
│   │   └── pages/         # Page components
│   └── package.json
│
├── server/                 # Backend Node.js application
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── lib/               # Utility functions
│   └── server.js          # Entry point
│
└── README.md

🔑 Key Features Explanation
Real-time Messaging
Messages are delivered instantly using Socket.io WebSocket connections. When a user sends a message, it's immediately broadcasted to the recipient if they're online.
AI Assistant
The application includes an AI chatbot that users can interact with. Messages to the AI are processed through a backend API endpoint and responses are displayed in real-time.
Online Status
Socket.io tracks connected users and broadcasts online/offline status updates to all clients in real-time.
Optimistic UI Updates
Messages appear instantly in the UI before server confirmation, providing a smooth user experience.

👤 Author
Mohamed Salah
GitHub: @xXSALAHELEQASXx
