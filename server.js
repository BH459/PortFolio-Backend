const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');
const port = process.env.Port;
require('dotenv').config({ path: './.env' });

app.use(cors());

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Mongoose User Schema and Model
const userSchema = new mongoose.Schema({
  Name: String,
  Email: String,
  Message: String
});

const User = mongoose.model('User', userSchema);

// POST /register route
app.post('/api/register', async (req, res) => {
  const { Name, Email, Message } = req.body;

  try {
    const newUser = new User({ Name, Email, Message });
    await newUser.save();

    res.status(201).json({
      status: 201,
      message: 'User registered successfully'
    });
  } catch (err) {
    console.error("❌ Error registering user", err);

    res.status(500).json({
      status: 500,
      error: 'Error registering user'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${process.env.Port}`);
});
