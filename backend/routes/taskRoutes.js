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