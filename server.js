const express = require('express');
const mongoose = require('mongoose');
const { Resend } = require('resend');
const app = express();
const cors = require('cors');
require('dotenv').config({ path: './.env' });

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Email sending function
const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Website <website@resend.dev>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Email error:', error);
      return { success: false, error };
    } else {
      console.log('Email sent successfully:', data);
      return { success: true, data };
    }
  } catch (error) {
    console.error('Email catch error:', error);
    return { success: false, error };
  }
};

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

    const adminEmailResult = await sendEmail({
      to: 'technoempire921@gmail.com', // Your admin email
      subject: 'New User Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New User Registration</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
            <p><strong>Name:</strong> ${Name}</p>
            <p><strong>Email:</strong> ${Email}</p>
            <p><strong>Message:</strong></p>
            <p style="background-color: white; padding: 10px; border-radius: 3px;">${Message}</p>
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            This notification was sent automatically when a new user registered.
          </p>
        </div>
      `
    });

    res.status(201).json({
      status: 201,
      message: 'User registered successfully',
      emailSent: adminEmailResult.success,
      user: { Name, Email }
    });
  } catch (err) {
    console.error("❌ Error registering user", err);

    res.status(500).json({
      status: 500,
      error: 'Error registering user'
    });
  }
});

app.get('/', (req, res) => {
  res.send('Hello from Express.js!');
});


// Start server
app.listen(`${process.env.Port}`, () => {
  console.log(`Server is running at http://localhost:${process.env.Port}`);
});
