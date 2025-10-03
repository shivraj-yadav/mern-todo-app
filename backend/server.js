const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Hardcoded MongoDB URI (instead of process.env.MONGO_URI)
const MONGO_URI = "mongodb://127.0.0.1:27017/todoDB"; // example local MongoDB

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/tasks', taskRoutes);

// ✅ Hardcoded Port
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
