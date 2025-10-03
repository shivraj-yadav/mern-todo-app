# 🔐 Authentication Setup Guide

This guide contains the manual steps required to complete the authentication upgrade for your MERN Todo app.

## 📋 Manual Steps Required

### **Step 1: Update Task Model**

Replace the contents of `backend/models/Task.js` with the following:

```javascript
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [1, 'Task title cannot be empty'],
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  }
}, {
  timestamps: true
});

// Index for faster user-based queries
taskSchema.index({ user: 1, createdAt: -1 });

// Instance method to toggle completion
taskSchema.methods.toggleComplete = function() {
  this.completed = !this.completed;
  return this.save();
};

module.exports = mongoose.model('Task', taskSchema);
```

### **Step 2: Update Task Routes**

Replace the contents of `backend/routes/taskRoutes.js` with the contents from `backend/routes/taskRoutesWithAuth.js` that was created during the upgrade.

**Or copy this complete file:**

```javascript
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(auth);

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;

    // Validation
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        message: 'Task title is required'
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        message: 'Task title cannot exceed 200 characters'
      });
    }

    // Create task with user reference
    const newTask = new Task({
      title: title.trim(),
      user: req.user._id
    });

    await newTask.save();

    // Populate user info if needed (optional)
    await newTask.populate('user', 'name email');

    res.status(201).json({
      message: 'Task created successfully',
      task: newTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      message: 'Server error while creating task'
    });
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { completed, sort = '-createdAt', limit = 100, page = 1 } = req.query;
    
    // Build query for user's tasks only
    const query = { user: req.user._id };
    
    // Filter by completion status if specified
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get tasks with pagination and sorting
    const tasks = await Task.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('user', 'name email');

    // Get total count for pagination info
    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      message: 'Server error while fetching tasks'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { title, completed } = req.body;
    
    // Build update object
    const updateData = {};
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          message: 'Task title cannot be empty'
        });
      }
      if (title.trim().length > 200) {
        return res.status(400).json({
          message: 'Task title cannot exceed 200 characters'
        });
      }
      updateData.title = title.trim();
    }
    
    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
    }

    // Find and update task (only if it belongs to the user)
    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!updatedTask) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid task ID'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: messages
      });
    }
    
    res.status(500).json({
      message: 'Server error while updating task'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!deletedTask) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    res.json({
      message: 'Task deleted successfully',
      task: deletedTask
    });
  } catch (error) {
    console.error('Delete task error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid task ID'
      });
    }
    
    res.status(500).json({
      message: 'Server error while deleting task'
    });
  }
});

module.exports = router;
```

### **Step 3: Install New Dependencies**

Run the following command in your backend directory:

```bash
cd backend
npm install bcryptjs jsonwebtoken validator
```

### **Step 4: Clean Up Temporary Files**

Delete these temporary files that were created during the upgrade:
- `backend/models/TaskWithAuth.js`
- `backend/routes/taskRoutesWithAuth.js`

## 🚀 Deployment Configuration

### **Step 5: Update Render Environment Variables**

In your Render dashboard, add these environment variables:

```
MONGO_URI=mongodb+srv://root:root@learning.svtiqis.mongodb.net/todoDB?retryWrites=true&w=majority&appName=Learning
PORT=10000
JWT_SECRET=mern-todo-app-super-secret-jwt-key-production-2024-secure
JWT_EXPIRE=7d
NODE_ENV=production
FRONTEND_URL=https://mern-todo-app-five-xi.vercel.app
```

### **Step 6: Update Vercel Environment Variables**

In your Vercel dashboard, ensure you have:

```
VITE_API_URL=https://learning-mern-fr02.onrender.com
```

## 🧪 Testing Steps

### **Step 7: Local Testing**

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Test Authentication:**
   - Visit `http://localhost:5173`
   - Register a new account
   - Login with credentials
   - Create, update, and delete tasks
   - Logout and login again

### **Step 8: Production Testing Checklist**

After deployment, test these features:

#### **Authentication Flow**
- ✅ Register new user with validation
- ✅ Login with correct credentials
- ✅ Login fails with wrong credentials
- ✅ Auto-logout on token expiration
- ✅ Protected routes redirect to login

#### **Task Management**
- ✅ Create tasks (user-specific)
- ✅ View only your own tasks
- ✅ Update task completion status
- ✅ Delete tasks with confirmation
- ✅ Filter tasks (All, Pending, Completed)

#### **User Experience**
- ✅ Loading states during API calls
- ✅ Error handling and user feedback
- ✅ Responsive design on mobile
- ✅ Navigation and logout functionality

## 🔧 Troubleshooting

### **Common Issues:**

#### **1. "User is required" Error**
- **Cause:** Task model not updated with user field
- **Solution:** Complete Step 1 above

#### **2. "Authorization denied" Error**
- **Cause:** JWT middleware not applied to routes
- **Solution:** Complete Step 2 above

#### **3. "bcryptjs not found" Error**
- **Cause:** Dependencies not installed
- **Solution:** Run `npm install bcryptjs jsonwebtoken validator`

#### **4. Tasks from other users visible**
- **Cause:** Old task routes still in use
- **Solution:** Replace taskRoutes.js with authenticated version

#### **5. Login/Register not working**
- **Cause:** Auth routes not connected
- **Solution:** Verify server.js has `app.use('/api/auth', authRoutes)`

## 🎯 Final Verification

After completing all steps, your app should have:

1. **Secure Authentication** - JWT-based login/register
2. **User-Specific Data** - Each user sees only their tasks
3. **Protected Routes** - Authentication required for all task operations
4. **Modern UI** - Beautiful login/register forms
5. **Error Handling** - Comprehensive error management
6. **Production Ready** - Proper environment configuration

## 🚀 Deployment Commands

Once manual steps are complete:

```bash
# Commit all changes
git add .
git commit -m "🔐 Add JWT authentication with user-specific tasks

- User registration and login with bcrypt password hashing
- JWT token-based authentication with 7-day expiration
- Protected API routes - users can only access their own tasks
- Modern login/register UI with validation and error handling
- Navigation header with user info and logout functionality
- Comprehensive error boundaries and loading states
- Production-ready environment variable configuration"

# Push to trigger automatic deployments
git push origin master
```

Your authenticated todo app will be live in ~5 minutes! 🎉

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure all manual steps are completed
4. Check server logs in Render dashboard

**Happy coding with your secure, production-ready todo app!** 🚀
