
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const Email = require('./models/Email');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((error) => console.log('MongoDB Connection Error:', error));

app.use(cors());
app.use(express.json());

// Email validation
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Spam keywords
const spamKeywords = [
  'free',
  'winner',
  'won',
  'prize',
  'urgent',
  'claim',
  'offer',
  'lottery',
  'congratulations',
  'cash'
];

// DFA: Finite Automata
function detectSpam(text) {
  const words = text.toLowerCase().match(/[a-z]+/g) || [];

  let state = 'q0';
  const detected = [];

  for (const word of words) {
    if (spamKeywords.includes(word) && !detected.includes(word)) {
      detected.push(word);

      if (state === 'q0') {
        state = 'q1';
      } else {
        state = 'q2';
      }
    }
  }

  let classification = 'Safe';

  if (state === 'q1') {
    classification = 'Suspicious';
  } else if (state === 'q2') {
    classification = 'Spam';
  }

  return {
    finalState: state,
    classification,
    detectedPatterns: detected
  };
}

// Home API
app.get('/', (req, res) => {
  res.send('MailGuard Backend is Running!');
});

// Health API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MailGuard Server is Working'
  });
});

// Email Analysis API
app.post('/api/analyze', async (req, res) => {
  try {
    const { sender, subject, message } = req.body;

    if (!sender || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (!emailPattern.test(sender)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address'
      });
    }

    const result = detectSpam(subject + ' ' + message);

    const newEmail = new Email({
      sender,
      subject,
      message,
      classification: result.classification,
      detectedPatterns: result.detectedPatterns,
      finalState: result.finalState
    });

    await newEmail.save();

    res.json({
      success: true,
      message: 'Email analyzed and saved successfully',
      sender,
      subject,
      ...result
    });

  } catch (error) {
    console.log('Email Analysis Error:', error);

    res.status(500).json({
      success: false,
      message: 'Server error while analyzing email'
    });
  }
});

// Get Email History API
app.get('/api/history', async (req, res) => {
  try {
    const emails = await Email.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: emails.length,
      emails
    });

  } catch (error) {
    console.log('Email History Error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch email history'
    });
  }
});

// Dashboard Statistics API
app.get('/api/dashboard', async (req, res) => {
  try {
    const totalEmails = await Email.countDocuments();

    const safeEmails = await Email.countDocuments({
      classification: 'Safe'
    });

    const suspiciousEmails = await Email.countDocuments({
      classification: 'Suspicious'
    });

    const spamEmails = await Email.countDocuments({
      classification: 'Spam'
    });

    const spamPercentage = totalEmails > 0
      ? ((spamEmails / totalEmails) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      totalEmails,
      safeEmails,
      suspiciousEmails,
      spamEmails,
      spamPercentage
    });

  } catch (error) {
    console.log('Dashboard Error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to load dashboard statistics'
    });
  }
});

// Start Server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`MailGuard Server running on port ${PORT}`);
});
