const express = require('express');
const mongoose = require('mongoose');
const { Resend } = require('resend');
const path = require('path');
const app = express();
const cors = require('cors');
require('dotenv').config({ path: './.env' });

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/pdf/resume', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'pdfs', 'resume.pdf');
  res.sendFile(filePath);
});

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
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; background-color: #f4f7fa;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); overflow: hidden;">
    
    <!-- Header -->
    <div style="background-color: #4A90E2; padding: 25px 30px;">
      <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">🎉 New User Registration</h2>
    </div>
    
    <!-- Body Content -->
    <div style="padding: 30px;">
      <p style="font-size: 16px; color: #333333; margin: 0 0 15px;"><strong>Name:</strong> ${Name}</p>
      <p style="font-size: 16px; color: #333333; margin: 0 0 15px;"><strong>Email:</strong> ${Email}</p>
      
      <p style="font-size: 16px; color: #333333; margin: 0 0 10px;"><strong>Message:</strong></p>
      <div style="background-color: #eef4fc; padding: 15px 20px; border-left: 5px solid #4A90E2; border-radius: 6px; color: #555555; font-size: 15px; line-height: 1.6;">
        ${Message}
      </div>
    </div>
    
    <!-- Footer -->
    <div style="padding: 20px 30px; background-color: #f9f9f9; text-align: center; font-size: 14px; color: #999999;">
      This is an automated notification sent when a new user registers.
    </div>
  </div>
</div>`});

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
