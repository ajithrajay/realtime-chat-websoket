# Full-Stack WebSocket Chat System

## Overview
This is a real-time chat application using WebSockets with a Node.js backend and a React frontend.

## Features
- WebSocket-based real-time messaging
- User authentication (register & login)
- Private messaging
- Chat history storage with MongoDB
- Typing indicators
- Connection handling (reconnection on disconnect)

## Tech Stack
- **Backend**: Node.js, WebSocket (`ws` library), Express, MongoDB
- **Frontend**: React, WebSocket API, TailwindCSS
- **Database**: MongoDB (for storing chat history)

## Setup Instructions

### **Backend Setup**
1. Clone the repository:
   git clone https://github.com/ajithrajay/realtime-chat-websoket.git
2.Navigate to the backend folder:
cd backend
3.Install dependencies:
npm install
4.Create a .env file and add the following:
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<your-secret-key>
5.Start the server:
node server.js

### **Frontend Setup**
1.Navigate to the frontend folder:
cd frontend
2.Install dependencies:
npm install
3.Start the development server:
node server.js
Open http://localhost:3000 in your browser.




