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
  to: 'technoempire921@gmail.com',
  subject: '🚀 New User Registration Alert!',
  html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(to bottom right, #4A90E2, #ffffff); padding: 30px;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); overflow: hidden;">
        <div style="background-color: #4A90E2; padding: 20px 30px;">
          <h2 style="color: #ffffff; margin: 0;">New User Registration</h2>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333;"><strong>Name:</strong> ${Name}</p>
          <p style="font-size: 16px; color: #333;"><strong>Email:</strong> ${Email}</p>
          <p style="font-size: 16px; color: #333;"><strong>Message:</strong></p>
          <div style="background-color: #f1f1f1; padding: 15px; border-left: 4px solid #4A90E2; border-radius: 4px; margin-top: 10px; color: #555;">
            ${Message}
          </div>
        </div>
        <div style="padding: 20px 30px; background-color: #fafafa; text-align: center; font-size: 14px; color: #888;">
          This notification was sent automatically when a new user registered.
        </div>
      </div>
    </div>
  `});

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
