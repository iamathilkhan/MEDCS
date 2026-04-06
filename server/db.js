const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Initialize database schema
const initDb = () => {
  // 1. Schemes Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS schemes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      ministry TEXT,
      category TEXT NOT NULL,
      benefits TEXT NOT NULL,
      eligibility TEXT NOT NULL, -- JSON string
      documents TEXT NOT NULL,   -- JSON string
      applicationUrl TEXT,
      applyOffline BOOLEAN,
      languages TEXT,            -- JSON string
      tags TEXT                  -- JSON string
    )
  `).run();

  // 2. Users Table (for session persistence)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT UNIQUE,
      name TEXT,
      profile_json TEXT,         -- JSON string of the eligibility form
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // 3. Applications Table (tracking attempts)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT,
      scheme_id TEXT,
      status TEXT DEFAULT 'Intent Logged',
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (scheme_id) REFERENCES schemes(id)
    )
  `).run();

  // Seed schemes if empty
  const count = db.prepare('SELECT count(*) as count FROM schemes').get().count;
  if (count === 0) {
    const rawData = fs.readFileSync(path.join(__dirname, 'schemes.json'), 'utf8');
    const schemesData = JSON.parse(rawData);
    
    const insert = db.prepare(`
      INSERT INTO schemes (id, name, ministry, category, benefits, eligibility, documents, applicationUrl, applyOffline, languages, tags)
      VALUES (@id, @name, @ministry, @category, @benefits, @eligibility, @documents, @applicationUrl, @applyOffline, @languages, @tags)
    `);

    const transaction = db.transaction((schemes) => {
      for (const scheme of schemes) {
        insert.run({
          id: scheme.id,
          name: scheme.name,
          ministry: scheme.ministry,
          category: scheme.category,
          benefits: scheme.benefits,
          eligibility: JSON.stringify(scheme.eligibility),
          documents: JSON.stringify(scheme.documents),
          applicationUrl: scheme.applicationUrl,
          applyOffline: scheme.applyOffline ? 1 : 0,
          languages: JSON.stringify(scheme.languages),
          tags: JSON.stringify(scheme.tags)
        });
      }
    });

    transaction(schemesData.schemes);
    console.log(`Seeded ${schemesData.schemes.length} schemes into the database using better-sqlite3.`);
  }
};

module.exports = { db, initDb };
