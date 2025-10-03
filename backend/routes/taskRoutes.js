const express = require('express');
const router = express.Router();
const Task = require('../models/Task');


// Create task
router.post('/', async (req, res) => {
const newTask = new Task(req.body);
await newTask.save();
res.json(newTask);
});


// Get all tasks
router.get('/', async (req, res) => {
const tasks = await Task.find();
res.json(tasks);
});


// Update task
router.put('/:id', async (req, res) => {
const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
res.json(updatedTask);
});


// Delete task
router.delete('/:id', async (req, res) => {
await Task.findByIdAndDelete(req.params.id);
res.json({ message: 'Task deleted' });
});


module.exports = router;