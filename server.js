const express = require('express');
const validator = require('validator');
const db = require('./database');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.get('/api/events', (req, res) => {
  db.all("SELECT * FROM events", (err, rows) => {
    if(err) return res.status(500).json({error: "DB error"});
    res.json(rows);
  });
});

app.get('/api/events/:id', (req, res) => {
  db.get("SELECT * FROM events WHERE id = ?", [req.params.id], (err, row) => {
    if(!row) return res.status(404).json({error: "Event not found"});
    res.json(row);
  });
});

app.post('/api/registrations', (req, res) => {
  const { event_id, name, email } = req.body;
  if(!event_id || !name || !email) return res.status(400).json({error: "All fields required"});
  if(!validator.isEmail(email)) return res.status(400).json({error: "Invalid email"});

  db.get("SELECT * FROM events WHERE id = ?", [event_id], (err, event) => {
    if(!event) return res.status(404).json({error: "Event not found"});
    if(event.available_slots <= 0) return res.status(400).json({error: "Event full"});

    db.run("INSERT INTO registrations (event_id, name, email) VALUES (?, ?, ?)",
    [event_id, name, email], function(err){
      if(err){
        if(err.message.includes("UNIQUE")) return res.status(400).json({error: "You already registered for this event"});
        return res.status(500).json({error: "DB error"});
      }
      db.run("UPDATE events SET available_slots = available_slots - 1 WHERE id = ?", [event_id]);
      res.json({message: "Registered Successfully!", id: this.lastID});
    });
  });
});

app.get('/api/registrations/:email', (req, res) => {
  db.all(`SELECT r.id as regId, r.name, r.email, e.title, e.date, e.venue FROM registrations r JOIN events e ON r.event_id = e.id WHERE r.email = ?`, [req.params.email], (err, rows) => {
    res.json(rows);
  });
});

app.delete('/api/registrations/:id', (req, res) => {
  db.get("SELECT * FROM registrations WHERE id = ?", [req.params.id], (err, reg) => {
    if(!reg) return res.status(404).json({error: "Registration not found"});
    db.run("DELETE FROM registrations WHERE id = ?", [req.params.id], () => {
      db.run("UPDATE events SET available_slots = available_slots + 1 WHERE id = ?", [reg.event_id]);
      res.json({message: "Cancelled Successfully"});
    });
  });
});

app.listen(PORT, () => console.log(`Event System running on http://localhost:${PORT}`));