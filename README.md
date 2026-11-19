# MailGuard – Email Security and Spam Pattern Detection System

MailGuard is a web-based email security system that analyzes email content and identifies whether an email is Safe, Suspicious, or Spam using spam keyword detection and a Finite Automaton (DFA).

## Live Website
[Open MailGuard](https://mail-guard-email-security-qzkdcbdhu-mail-guard.vercel.app/)

## Features
- Email content analysis
- Spam keyword detection
- DFA-based classification
- Safe, Suspicious, and Spam identification
- Email history tracking
- Dashboard with email statistics
- MongoDB database integration

## Technologies Used
- **Frontend:** React.js, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Deployment:** Vercel and Render
- **Algorithm:** Deterministic Finite Automaton (DFA)

## How It Works
1. User enters the sender email, subject, and message.
2. MailGuard analyzes the email content.
3. The DFA checks for spam-related keywords.
4. The system classifies the email as Safe, Suspicious, or Spam.
5. The result is stored in MongoDB and displayed in the dashboard and history.

## Classification
- **Safe (q0):** No spam keywords detected.
- **Suspicious (q1):** One distinct spam keyword detected.
- **Spam (q2):** Two or more distinct spam keywords detected.

## Repository
[GitHub – MailGuard](https://github.com/kanmani-12/MailGuard-Email-Security)
