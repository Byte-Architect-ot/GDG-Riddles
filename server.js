// server.js
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'leaderboardDB';

let db;

// Middleware
app.use(cors());
app.use(express.json());
// Serve frontend from /public
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
async function connectDB() {
  try {
    console.log('Connecting to MongoDB...');
    const client = new MongoClient(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
      // remove any tlsAllowInvalid... options in production
    });
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB:', DB_NAME);

    // Insert dummy data if empty
    const count = await db.collection('scores').countDocuments();
    console.log(`Current records: ${count}`);

    if (count === 0) {
      const dummyData = [
        { name: 'Alice', score: 1500, submittedAt: new Date().toISOString() },
        { name: 'Bob', score: 1200, submittedAt: new Date().toISOString() },
        { name: 'Charlie', score: 1800, submittedAt: new Date().toISOString() }
      ];
      await db.collection('scores').insertMany(dummyData);
      console.log('✅ Dummy data inserted!');
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    // in production you might not want to exit; useful in early dev:
    process.exit(1);
  }
}

// GET leaderboard (top 10)
app.get('/api/leaderboard', async (req, res) => {
  try {
    const scores = await db.collection('scores')
      .find()
      .sort({ score: -1 })
      .limit(10)
      .toArray();
    res.json(scores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// POST a new score
app.post('/api/score', async (req, res) => {
  try {
    const { name, score } = req.body;
    if (!name || score === undefined) {
      return res.status(400).json({ success: false, message: 'Name and score are required' });
    }

    const parsedScore = parseInt(score, 10);
    if (Number.isNaN(parsedScore)) {
      return res.status(400).json({ success: false, message: 'Score must be a number' });
    }

    const doc = {
      name: name.trim(),
      score: parsedScore,
      submittedAt: new Date().toISOString()
    };

    const result = await db.collection('scores').insertOne(doc);
    res.json({ success: true, message: 'Score added', id: result.insertedId });
  } catch (error) {
    console.error('POST /api/score error:', error);
    res.status(500).json({ success: false, message: 'Failed to add score' });
  }
});

// Debug route (optional)
app.get('/api/debug', async (req, res) => {
  try {
    const allData = await db.collection('scores').find().toArray();
    const count = await db.collection('scores').countDocuments();
    res.json({
      message: 'Debug info',
      database: DB_NAME,
      collection: 'scores',
      totalRecords: count,
      data: allData
    });
  } catch (error) {
    res.status(500).json({ error: 'Debug failed' });
  }
});

// Fallback to index.html for SPA routes (if you want client routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Leaderboard endpoint: http://localhost:${PORT}/api/leaderboard`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});