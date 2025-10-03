# 📝 Todo Master - MERN Stack Todo Application

A modern, full-stack todo application built with the MERN stack (MongoDB, Express.js, React, Node.js) with **complete authentication system**. This project demonstrates modern web development practices with a beautiful, responsive UI, robust backend architecture, and production-ready authentication.


## 🌟 Features

### ✨ **User Interface**
- **Modern Design** - Beautiful gradient backgrounds and card-based layouts
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- **Smooth Animations** - Micro-interactions and loading states
- **Dark Mode Support** - Automatic dark mode detection
- **PWA Ready** - Can be installed as a mobile app

### 🔐 **Authentication System**
- **User Registration** - Create new accounts with validation
- **User Login** - Secure authentication with JWT tokens
- **Password Security** - Bcrypt hashing with optimized rounds
- **Protected Routes** - Access control for authenticated users
- **Session Management** - Automatic token refresh and logout
- **Error Handling** - Beautiful UI error messages with alerts

### 🚀 **Todo Functionality**
- **Create Tasks** - Add new todos with validation (authenticated users only)
- **Mark Complete** - Toggle task completion status
- **Delete Tasks** - Remove tasks with confirmation
- **Filter Tasks** - View all, pending, or completed tasks
- **Task Statistics** - Real-time count of total, pending, and completed tasks
- **User-specific Tasks** - Each user sees only their own tasks
- **Persistent Storage** - Data stored in MongoDB Atlas

### 🛡️ **Production Ready**
- **Error Handling** - Comprehensive error boundaries and API error handling
- **Loading States** - Visual feedback for all async operations
- **Input Validation** - Client and server-side validation
- **CORS Configuration** - Secure cross-origin requests
- **Environment Variables** - Proper configuration management

## 🛠️ Tech Stack

### **Frontend**
- **React 19** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Axios** - HTTP client for API requests
- **CSS3** - Custom CSS with modern features (Grid, Flexbox, Animations)
- **Google Fonts** - Inter font family for premium typography

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing and security
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### **Database**
- **MongoDB Atlas** - Cloud-hosted MongoDB database
- **Mongoose ODM** - Object Document Mapping for MongoDB

### **Deployment**
- **Vercel** - Frontend hosting and deployment
- **Render** - Backend hosting and deployment
- **GitHub** - Version control and CI/CD integration

## 📁 Project Structure

```
mern-todo-app/
├── backend/                 # Node.js/Express backend
│   ├── models/             # Mongoose models
│   │   ├── Task.js         # Task model schema
│   │   └── User.js         # User model with authentication
│   ├── routes/             # API routes
│   │   ├── taskRoutes.js   # Task CRUD operations
│   │   └── authRoutes.js   # Authentication routes
│   ├── middleware/         # Custom middleware
│   │   └── auth.js         # JWT authentication middleware
│   ├── .env                # Environment variables
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express server setup
├── frontend/               # React frontend
│   ├── public/             # Static assets
│   │   └── manifest.json   # PWA manifest
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── TaskForm.jsx      # Task creation form
│   │   │   ├── TaskList.jsx      # Task display component
│   │   │   ├── Login.jsx         # Login form
│   │   │   ├── Register.jsx      # Registration form
│   │   │   ├── Navigation.jsx    # Navigation bar
│   │   │   ├── AuthWrapper.jsx   # Authentication wrapper
│   │   │   ├── ErrorAlert.jsx    # Error display component
│   │   │   ├── ErrorBoundary.jsx # Error handling
│   │   │   ├── DevTools.jsx      # Development tools
│   │   │   └── PerformanceMonitor.jsx # Performance monitoring
│   │   ├── contexts/       # React contexts
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── App.jsx         # Main application component
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles
│   ├── .env                # Development environment variables
│   ├── .env.production     # Production environment variables
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.js      # Vite configuration
│   └── vercel.json         # Vercel deployment config
├── DEPLOYMENT.md           # Deployment instructions
└── README.md              # Project documentation
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (free)
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/mern-todo-app.git
   cd mern-todo-app
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   
   **Backend (.env):**
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/todoDB
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   NODE_ENV=development
   ```
   
   **Frontend (.env):**
   ```env
   VITE_API_URL=http://localhost:5000
   ```
   
   **Frontend (.env.production):**
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

5. **Start Development Servers**
   
   **Backend (Terminal 1):**
   ```bash
   cd backend
   npm start
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🌐 Live Demo

- **Frontend:** [https://mern-todo-app-five-xi.vercel.app](https://mern-todo-app-five-xi.vercel.app)
- **Backend API:** [https://learning-mern-fr02.onrender.com/api/tasks](https://learning-mern-fr02.onrender.com/api/tasks)

## 📚 API Endpoints

### **Authentication Routes**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/health` | Health check | No |

### **Task Routes**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get user's tasks | Yes |
| POST | `/api/tasks` | Create a new task | Yes |
| PUT | `/api/tasks/:id` | Update a task | Yes |
| DELETE | `/api/tasks/:id` | Delete a task | Yes |

### **Example API Usage**

**Register a new user:**
```javascript
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
Response: {
  "success": true,
  "message": "Registration successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Login user:**
```javascript
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
Response: {
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6g7h8i9j0",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Get user's tasks:**
```javascript
GET /api/tasks
Headers: { "Authorization": "Bearer your-jwt-token" }
Response: {
  "success": true,
  "tasks": [
    {
      "_id": "64f8a1b2c3d4e5f6g7h8i9j0",
      "title": "Learn React",
      "completed": false,
      "user": "64f8a1b2c3d4e5f6g7h8i9j0",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## 🎨 Key Features Explained

### **Authentication Components**
- **Login Form**: Beautiful login interface with validation and error handling
- **Register Form**: User registration with password confirmation and validation
- **Navigation Bar**: User info display with logout functionality
- **AuthWrapper**: Automatic authentication state management
- **Protected Routes**: Route protection for authenticated users only

### **Modern UI Components**
- **TaskForm**: Smart input with validation, loading states, and keyboard shortcuts
- **TaskList**: Interactive cards with hover effects and smooth animations
- **Filter System**: Dynamic filtering with real-time task counts
- **Statistics Dashboard**: Visual representation of task completion progress
- **Error Alerts**: Beautiful error messages with auto-dismiss functionality

### **Error Handling**
- **Error Boundary**: Catches React component errors gracefully
- **API Interceptors**: Handles network errors and timeouts
- **User Feedback**: Clear error messages and retry mechanisms

### **Performance Optimizations**
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Optimized re-renders with useCallback
- **Debounced Inputs**: Reduced API calls for better performance

## 🚀 Deployment

This project is configured for easy deployment on modern platforms:

### **Frontend (Vercel)**
- Automatic deployments from GitHub
- Environment variables configured
- Custom domain support

### **Backend (Render)**
- Automatic deployments from GitHub
- Environment variables configured
- Free tier with automatic sleep


## 📱 Mobile Experience

The app is fully optimized for mobile devices:
- **Touch-friendly** button sizes
- **Responsive layouts** for all screen sizes
- **PWA support** - can be installed as a mobile app
- **Offline-ready** (with service worker)

## 🔧 Development Scripts

### **Backend**
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### **Frontend**
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🤝 Contributing

This is a learning project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Learning Objectives

This project demonstrates:
- **Full-stack development** with MERN stack
- **Authentication system** with JWT and bcrypt
- **RESTful API** design and implementation
- **Modern React** patterns and hooks (Context API, Custom Hooks)
- **Responsive web design** principles
- **Database** integration with MongoDB and user relationships
- **Deployment** to cloud platforms (Vercel + Render)
- **Error handling** and user experience
- **Production-ready** code practices
- **Security best practices** (password hashing, JWT tokens, CORS)
- **Performance optimization** (caching, loading states, error boundaries)

## 🐛 Known Issues

- Free tier backend may have cold starts (30-50 second delay)
- MongoDB Atlas free tier has 512MB storage limit



## 👨‍💻 Author

**Shivraj Yadav**
- GitHub: [@shivraj-yadav](https://github.com/shivraj-yadav)
- LinkedIn: [Shivraj Yadav](https://linkedin.com/in/shivraj-yadav)
- Email: shivrajyadav320@example.com

## 🙏 Acknowledgments

- **MongoDB Atlas** for free database hosting
- **Vercel** for seamless frontend deployment
- **Render** for reliable backend hosting
- **React Team** for the amazing framework
- **Node.js Community** for excellent tools and libraries

---

⭐ **If you found this project helpful, please give it a star!** ⭐

**Happy Coding! 🚀**
