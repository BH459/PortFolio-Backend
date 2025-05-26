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
    <div style="
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
    min-height: 100vh; 
    padding: 40px 20px; 
    position: relative;
">
    <div style="
        max-width: 650px; 
        margin: 0 auto; 
        background: rgba(255, 255, 255, 0.95); 
        border-radius: 20px; 
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 8px 32px rgba(31, 38, 135, 0.37); 
        overflow: hidden; 
        backdrop-filter: blur(15px); 
        border: 1px solid rgba(255, 255, 255, 0.18);
    ">
        <div style="
            background: linear-gradient(135deg, #4A90E2 0%, #357ABD 50%, #2E5F8A 100%); 
            padding: 35px 40px; 
            position: relative; 
            overflow: hidden;
        ">
            <div style="
                position: absolute; 
                top: -20px; 
                right: -20px; 
                width: 100px; 
                height: 100px; 
                background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%); 
                border-radius: 50%;
            "></div>
            <div style="
                position: absolute; 
                bottom: -30px; 
                left: -30px; 
                width: 80px; 
                height: 80px; 
                background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%); 
                border-radius: 50%;
            "></div>
            <h2 style="
                color: #ffffff; 
                margin: 0; 
                font-size: 28px; 
                font-weight: 700; 
                text-align: center; 
                letter-spacing: 0.5px; 
                text-shadow: 0 2px 4px rgba(0,0,0,0.1); 
                position: relative; 
                z-index: 1;
            ">✨ New User Registration</h2>
        </div>
        
        <div style="padding: 40px;">
            <div style="
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
                padding: 25px; 
                border-radius: 15px; 
                margin-bottom: 25px; 
                border: 1px solid #e2e8f0; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            ">
                <p style="
                    font-size: 16px; 
                    color: #334155; 
                    margin: 0 0 15px 0; 
                    font-weight: 600;
                "><span style="
                    display: inline-block; 
                    background: linear-gradient(135deg, #4A90E2, #357ABD); 
                    color: white; 
                    padding: 4px 12px; 
                    border-radius: 20px; 
                    font-size: 14px; 
                    margin-right: 10px;
                ">👤</span><strong>Name:</strong> ${Name}</p>
                
                <p style="
                    font-size: 16px; 
                    color: #334155; 
                    margin: 0 0 15px 0; 
                    font-weight: 600;
                "><span style="
                    display: inline-block; 
                    background: linear-gradient(135deg, #4A90E2, #357ABD); 
                    color: white; 
                    padding: 4px 12px; 
                    border-radius: 20px; 
                    font-size: 14px; 
                    margin-right: 10px;
                ">📧</span><strong>Email:</strong> ${Email}</p>
            </div>
            
            <p style="
                font-size: 18px; 
                color: #1e293b; 
                margin: 0 0 15px 0; 
                font-weight: 700;
            ">💬 Message:</p>
            
            <div style="
                background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); 
                padding: 25px; 
                border-left: 6px solid #4A90E2; 
                border-radius: 12px; 
                margin-top: 15px; 
                color: #475569; 
                font-size: 16px; 
                line-height: 1.6; 
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); 
                position: relative;
            ">
                <div style="
                    position: absolute; 
                    top: 15px; 
                    right: 20px; 
                    width: 40px; 
                    height: 40px; 
                    background: rgba(74, 144, 226, 0.1); 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    font-size: 18px;
                ">💭</div>
                ${Message}
            </div>
        </div>
        
        <div style="
            padding: 25px 40px; 
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
            text-align: center; 
            font-size: 14px; 
            color: #64748b; 
            border-top: 1px solid #e2e8f0; 
            position: relative;
        ">
            <div style="
                position: absolute; 
                top: 0; 
                left: 50%; 
                transform: translateX(-50%); 
                width: 60px; 
                height: 3px; 
                background: linear-gradient(135deg, #4A90E2, #357ABD); 
                border-radius: 0 0 3px 3px;
            "></div>
            <p style="margin: 10px 0 0 0; font-style: italic;">
                🚀 This notification was sent automatically when a new user registered.
            </p>
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
