const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const rateLimit = require('express-rate-limit');
const { initDb, db } = require('./db');
const { matchSchemes, generateGuidance } = require('./matchEngine');

dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize database
initDb();

const app = express();

// --- Middleware ---

// 1. CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// 2. Body Parser
app.use(express.json());

// 3. Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'medcs-hackathon-secret-2026',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// 4. Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// AI Client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 10,
  message: { error: 'Too many requests, please try again in a minute.' }
});

// --- Routes ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), db: 'connected' });
});

// Schemes Endpoints
app.get('/api/schemes', (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM schemes';
  const params = [];
  
  if (category && category !== 'all') {
    query += ' WHERE category = ?';
    params.push(category);
  }
  
  const schemes = db.prepare(query).all(...params);
  res.json(schemes.map(s => ({
    ...s,
    eligibility: JSON.parse(s.eligibility),
    documents: JSON.parse(s.documents),
    languages: JSON.parse(s.languages),
    tags: JSON.parse(s.tags)
  })));
});

app.get('/api/schemes/:id', (req, res) => {
  const scheme = db.prepare('SELECT * FROM schemes WHERE id = ?').get(req.params.id);
  if (scheme) {
    res.json({
      ...scheme,
      eligibility: JSON.parse(scheme.eligibility),
      documents: JSON.parse(scheme.documents),
      languages: JSON.parse(scheme.languages),
      tags: JSON.parse(scheme.tags)
    });
  } else {
    res.status(404).json({ error: 'Scheme not found' });
  }
});

// Eligibility Matching
app.post('/api/match', (req, res) => {
  try {
    const profile = req.body;
    const allSchemes = db.prepare('SELECT * FROM schemes').all();
    
    // Parse for engine
    const parsedSchemes = allSchemes.map(s => ({
      ...s,
      eligibility: JSON.parse(s.eligibility),
      documents: JSON.parse(s.documents),
      tags: JSON.parse(s.tags)
    }));

    const matched = matchSchemes(profile, parsedSchemes).map(scheme => ({
      ...scheme,
      guidance: generateGuidance(scheme, profile)
    }));

    const categories = matched.reduce((acc, scheme) => {
      acc[scheme.category] = (acc[scheme.category] || 0) + 1;
      return acc;
    }, {});

    res.json({ matched, totalFound: matched.length, categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chatbot API
app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    const { message, userProfile, conversationHistory } = req.body;
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(503).json({ error: 'Chat service currently unavailable.' });
    }

    const userProfileJSON = JSON.stringify(userProfile, null, 2);
    const systemPrompt = `You are MEDCS Assistant, a helpful government welfare schemes advisor for Indian citizens. You help people understand and apply for welfare schemes. Always respond in simple, clear language. If the user writes in Tamil, Hindi, or Telugu, respond in that language. Be empathetic — many users are rural citizens with low literacy. Never give wrong information; if unsure, ask them to visit the nearest CSC (Common Service Centre). Current user profile: ${userProfileJSON}`;

    const formattedHistory = (conversationHistory || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [...formattedHistory, { role: 'user', content: message }]
    });

    const reply = response.content[0].text;

    // AI Mention detection
    const allSchemes = db.prepare('SELECT id, name FROM schemes').all();
    const suggestedSchemes = allSchemes.filter(s => 
      reply.toLowerCase().includes(s.name.toLowerCase()) || 
      reply.toLowerCase().includes(s.id.toLowerCase())
    );

    res.json({ reply, suggestedSchemes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Profile Management
app.post('/api/profile', (req, res) => {
  const profile = req.body;
  req.session.userProfile = profile;
  
  // Persist to DB for history
  db.prepare(`
    INSERT INTO users (session_id, name, profile_json) 
    VALUES (?, ?, ?)
    ON CONFLICT(session_id) DO UPDATE SET 
      name = excluded.name, 
      profile_json = excluded.profile_json
  `).run(req.sessionID, profile.name, JSON.stringify(profile));

  res.json({ status: 'Success', message: 'Profile saved to session' });
});

app.get('/api/profile', (req, res) => {
  if (req.session.userProfile) {
    res.json(req.session.userProfile);
  } else {
    // Fallback to database
    const user = db.prepare('SELECT profile_json FROM users WHERE session_id = ?').get(req.sessionID);
    if (user) {
      res.json(JSON.parse(user.profile_json));
    } else {
      res.status(404).json({ error: 'No profile found in session' });
    }
  }
});

// Application Tracking
app.post('/api/apply/:schemeId', (req, res) => {
  const { schemeId } = req.params;
  db.prepare('INSERT INTO applications (session_id, scheme_id) VALUES (?, ?)').run(req.sessionID, schemeId);
  res.json({ status: 'Logged', message: `Application attempt for ${schemeId} recorded.` });
});

// Analytics Stats
app.get('/api/stats', (req, res) => {
  const totalUsers = db.prepare('SELECT count(*) as count FROM users').get().count;
  const totalApplications = db.prepare('SELECT count(*) as count FROM applications').get().count;
  
  const topSchemes = db.prepare(`
    SELECT schemes.name, count(applications.id) as application_count 
    FROM applications 
    JOIN schemes ON applications.scheme_id = schemes.id 
    GROUP BY schemes.name 
    ORDER BY application_count DESC 
    LIMIT 5
  `).all();

  res.json({
    totalUsers,
    totalApplications,
    topSchemes,
    uptime: process.uptime()
  });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

module.exports = app;
