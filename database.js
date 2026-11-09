const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./events.db', (err) => {
  if(err) console.log("DB fail", err);
  else console.log("Connected to Events DB");
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    venue TEXT NOT NULL,
    description TEXT,
    total_slots INTEGER,
    available_slots INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(event_id) REFERENCES events(id),
    UNIQUE(event_id, email)
  )`);

  db.get("SELECT COUNT(*) as count FROM events", (err, row) => {
    if(row && row.count === 0){
      db.run(`INSERT INTO events (title, date, venue, description, total_slots, available_slots) VALUES 
        ('Python Bootcamp', '2026-06-10', 'Zakiat Tech Hub', '2-day Python for beginners', 50, 50),
        ('AI Workshop', '2026-06-20', 'Zakiat Tech Hub', 'Intro to AI and Machine Learning', 30, 30),
        ('Hackathon', '2026-07-01', 'Online', '24hr Coding Challenge', 100, 100)
      `);
      console.log("Sample events added");
    }
  });
});

module.exports = db;