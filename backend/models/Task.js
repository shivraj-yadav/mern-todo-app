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