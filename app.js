const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const port = process.env.PORT || 3001;

// Replace the credentials and database name with your own
const db = mysql.createPool({
  host: 'localhost',
  user: 'jb-gpt',
  password: 'j4xinuKRSoDy%UajG',
  database: 'chatbot_server',
});

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query('INSERT INTO users (email, password) VALUES (?, ?)', [
      email,
      hashedPassword,
    ]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = existingUser[0];
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret', {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'User logged in successfully', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/chat', async (req, res) => {
  try {
    const { token, message } = req.body;

    if (!token || !message) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, 'your_jwt_secret');
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const result = await db.query(
      'INSERT INTO conversations (user_id, role, content) VALUES (?, ?, ?)',
      [decoded.id, 'user', message]
    );

    // Replace the following line with your actual AI response logic
    const aiResponse = 'AI response'; 

    // Insert the AI response into the database
    const aiResult = await db.query(
      'INSERT INTO conversations (user_id, role, content) VALUES (?, ?, ?)',
      [decoded.id, 'assistant', aiResponse]
    );

    // Send the user message and AI response back to the client
    res.status(200).json({
      message: 'Message saved and AI response generated',
      userMessage: { role: 'user', content: message },
      aiMessage: { role: 'assistant', content: aiResponse },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add the endpoint for fetching conversation history
app.get('/history', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, 'your_jwt_secret');
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Fetch the conversation history for the logged-in user
    const [history] = await db.query('SELECT * FROM conversations WHERE user_id = ?', [
      decoded.id,
    ]);

    // Send the conversation history back to the client
    res.status(200).json({
      message: 'Conversation history retrieved',
      history: history.map((record) => ({
        role: record.role,
        content: record.content,
        createdAt: record.created_at,
      })),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
