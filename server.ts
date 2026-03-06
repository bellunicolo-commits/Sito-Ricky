import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import crypto from "crypto";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.NODE_ENV === "production"
  ? "/data/fitplan.db"
  : "fitplan.db";

if (process.env.NODE_ENV === "production") {
  fs.mkdirSync("/data", { recursive: true });
}

const db = new Database(dbPath);

const db = new Database(dbPath);

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT CHECK(role IN ('pt', 'user')),
    bio TEXT,
    notification_email TEXT,
    email_notifications_enabled INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    token TEXT UNIQUE,
    expires_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    pt_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS plan_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER,
    day TEXT,
    exercise_name TEXT,
    category TEXT,
    sets TEXT,
    reps TEXT,
    pt_notes TEXT,
    user_notes TEXT,
    FOREIGN KEY(plan_id) REFERENCES plans(id)
  );

`);

// Migration: Ensure 'day' column exists in 'plan_items'
try {
  db.prepare("SELECT day FROM plan_items LIMIT 1").get();
} catch (e) {
  try {
    db.exec("ALTER TABLE plan_items ADD COLUMN day TEXT DEFAULT 'Giorno A'");
  } catch (alterErr) {
    // Column might already exist or other error
  }
}

// Migration: Ensure 'bio' column exists in 'users'
try {
  db.prepare("SELECT bio FROM users LIMIT 1").get();
} catch (e) {
  try {
    db.exec("ALTER TABLE users ADD COLUMN bio TEXT");
  } catch (alterErr) {}
}

// Migration: Ensure notification columns exist in 'users'
try {
  db.prepare("SELECT notification_email FROM users LIMIT 1").get();
} catch (e) {
  try {
    db.exec("ALTER TABLE users ADD COLUMN notification_email TEXT");
    db.exec("ALTER TABLE users ADD COLUMN email_notifications_enabled INTEGER DEFAULT 1");
  } catch (alterErr) {}
}

// Seed initial data if empty
const userCount = db.prepare("SELECT count(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run("pt@coachbellu.com", "password", "Coach Bellu", "pt");
  db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run("user@coachbellu.com", "password", "Luca Cliente", "user");

  const exercises = [
    { name: "Lat Machine", category: "schiena" },
    { name: "Rematore", category: "schiena" },
    { name: "Pull-up", category: "schiena" },
    { name: "Squat", category: "gambe" },
    { name: "Leg Press", category: "gambe" },
    { name: "Panca Piana", category: "petto" },
    { name: "Croci", category: "petto" },
    { name: "Military Press", category: "spalle" },
    { name: "Alzate Laterali", category: "spalle" },
    { name: "Curl Bilanciere", category: "braccia" },
    { name: "Pushdown", category: "braccia" }
  ];

  const insertEx = db.prepare("INSERT INTO exercises (name, category) VALUES (?, ?)");
  exercises.forEach(ex => insertEx.run(ex.name, ex.category));

  // Seed settings
  const seedSettings = [
    { key: 'about_title', value: 'Pietro Cassago' },
    { key: 'about_subtitle', value: 'Performance Elite' },
    { key: 'about_description', value: "Coach Bellu. Specialista in Calisthenics, Strength & Conditioning. Trasformo atleti attraverso un approccio scientifico e una programmazione d'élite personalizzata." },
    { key: 'about_specialty', value: 'Calisthenics' },
    { key: 'about_focus', value: 'Performance' },
    { key: 'about_standard', value: 'Elite' },
    { key: 'about_image', value: 'https://picsum.photos/seed/coachbellu/800/800' }
  ];
  const insertSetting = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
  seedSettings.forEach(s => insertSetting.run(s.key, s.value));
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT id, email, name, role, bio, notification_email, email_notifications_enabled FROM users WHERE email = ? AND password = ?").get(email, password);
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Credenziali non valide" });
    }
  });

  // Mailer Setup
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER || "demo_user",
      pass: process.env.SMTP_PASS || "demo_pass",
    },
  });

  const sendMail = async (to: string, subject: string, text: string) => {
    console.log(`[EMAIL] Sending to: ${to} | Subject: ${subject} | Content: ${text}`);
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        await transporter.sendMail({ from: '"Coach Bellu" <no-reply@coachbellu.com>', to, subject, text });
      } catch (err) {
        console.error("Error sending email:", err);
      }
    }
  };

  app.post("/api/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour
      db.prepare("INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)").run(user.id, token, expires);
      
      const resetUrl = `${req.headers.origin}/reset-password?token=${token}`;
      await sendMail(email, "Reset Password - Coach Bellu", `Ciao ${user.name}, clicca qui per resettare la tua password: ${resetUrl}`);
      
      res.json({ message: "Email di recupero inviata con successo!" });
    } else {
      res.status(404).json({ error: "Email non trovata" });
    }
  });

  app.post("/api/reset-password", (req, res) => {
    const { token, password } = req.body;
    const resetToken = db.prepare("SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > ?").get(token, new Date().toISOString()) as any;
    
    if (resetToken) {
      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(password, resetToken.user_id);
      db.prepare("DELETE FROM password_reset_tokens WHERE id = ?").run(resetToken.id);
      res.json({ message: "Password aggiornata con successo!" });
    } else {
      res.status(400).json({ error: "Token non valido o scaduto" });
    }
  });

  // Messaging & Notifications
  app.post("/api/messages", async (req, res) => {
    const { sender_id, receiver_id, content } = req.body;
    const { lastInsertRowid } = db.prepare("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)").run(sender_id, receiver_id, content);
    
    // Notify receiver if they are a coach and have email enabled
    const receiver = db.prepare("SELECT * FROM users WHERE id = ?").get(receiver_id) as any;
    if (receiver && receiver.role === 'pt' && receiver.email_notifications_enabled) {
      const sender = db.prepare("SELECT name FROM users WHERE id = ?").get(sender_id) as any;
      const targetEmail = receiver.notification_email || receiver.email;
      await sendMail(targetEmail, "Nuova Notifica - Coach Bellu", `Hai ricevuto un nuovo messaggio da ${sender.name}: "${content}"`);
    }
    
    res.json({ id: lastInsertRowid, sender_id, receiver_id, content });
  });

  app.get("/api/messages/:userId", (req, res) => {
    const { userId } = req.params;
    const { otherId } = req.query;
    const messages = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) 
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `).all(userId, otherId, otherId, userId);
    res.json(messages);
  });

  app.get("/api/notifications/:userId", (req, res) => {
    const messages = db.prepare(`
      SELECT m.*, u.name as sender_name 
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.receiver_id = ? AND m.is_read = 0
      ORDER BY m.created_at DESC
    `).all(req.params.userId);
    res.json(messages);
  });

  app.patch("/api/messages/read", (req, res) => {
    const { receiverId, senderId } = req.body;
    db.prepare("UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?").run(receiverId, senderId);
    res.json({ success: true });
  });

  app.patch("/api/users/:id/notifications", (req, res) => {
    const { notification_email, email_notifications_enabled } = req.body;
    db.prepare("UPDATE users SET notification_email = ?, email_notifications_enabled = ? WHERE id = ?").run(notification_email, email_notifications_enabled ? 1 : 0, req.params.id);
    res.json({ success: true });
  });

  app.post("/api/register", (req, res) => {
    const { email, password, name } = req.body;
    const role = 'user'; // Only allow user registration
    try {
      const { lastInsertRowid } = db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run(email, password, name, role);
      res.json({ id: lastInsertRowid, email, name, role });
    } catch (err) {
      res.status(400).json({ error: "Email già registrata" });
    }
  });

  app.get("/api/users", (req, res) => {
    // Return users info, including password for the coach dashboard
    const users = db.prepare("SELECT id, name, email, password, role, bio FROM users WHERE role = 'user'").all();
    res.json(users);
  });

  app.get("/api/coach", (req, res) => {
    const coach = db.prepare("SELECT id, name, email, role, bio FROM users WHERE role = 'pt' LIMIT 1").get();
    if (coach) {
      res.json(coach);
    } else {
      res.status(404).json({ error: "Coach non trovato" });
    }
  });

  app.patch("/api/users/:id", (req, res) => {
    const { name, email, bio } = req.body;
    try {
      db.prepare("UPDATE users SET name = ?, email = ?, bio = ? WHERE id = ?").run(name, email, bio, req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: "Email già in uso o dati non validi" });
    }
  });

  app.delete("/api/users/:id", (req, res) => {
    const transaction = db.transaction(() => {
      // Delete user's plans and items first
      const plans = db.prepare("SELECT id FROM plans WHERE user_id = ?").all(req.params.id) as { id: number }[];
      for (const plan of plans) {
        db.prepare("DELETE FROM plan_items WHERE plan_id = ?").run(plan.id);
      }
      db.prepare("DELETE FROM plans WHERE user_id = ?").run(req.params.id);
      db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
    });
    transaction();
    res.json({ success: true });
  });

  app.get("/api/exercises", (req, res) => {
    const exercises = db.prepare("SELECT * FROM exercises ORDER BY category, name").all();
    res.json(exercises);
  });

  app.post("/api/exercises", (req, res) => {
    const { name, category } = req.body;
    const { lastInsertRowid } = db.prepare("INSERT INTO exercises (name, category) VALUES (?, ?)").run(name, category);
    res.json({ id: lastInsertRowid, name, category });
  });

  app.patch("/api/exercises/:id", (req, res) => {
    const { name, category } = req.body;
    db.prepare("UPDATE exercises SET name = ?, category = ? WHERE id = ?").run(name, category, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/exercises/:id", (req, res) => {
    db.prepare("DELETE FROM exercises WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/plans/:id", (req, res) => {
    const transaction = db.transaction(() => {
      db.prepare("DELETE FROM plan_items WHERE plan_id = ?").run(req.params.id);
      db.prepare("DELETE FROM plans WHERE id = ?").run(req.params.id);
    });
    transaction();
    res.json({ success: true });
  });

  app.get("/api/plans/:userId/history", (req, res) => {
    const plans = db.prepare("SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
    const plansWithItems = plans.map(plan => {
      const items = db.prepare("SELECT * FROM plan_items WHERE plan_id = ?").all(plan.id);
      return { ...plan, items };
    });
    res.json(plansWithItems);
  });

  app.get("/api/plans/:userId", (req, res) => {
    const plan = db.prepare("SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1").get(req.params.userId);
    if (!plan) return res.json(null);
    
    const items = db.prepare("SELECT * FROM plan_items WHERE plan_id = ?").all(plan.id);
    res.json({ ...plan, items });
  });

  app.post("/api/plans", (req, res) => {
    const { userId, ptId, items } = req.body;
    
    const transaction = db.transaction(() => {
      const { lastInsertRowid } = db.prepare("INSERT INTO plans (user_id, pt_id) VALUES (?, ?)").run(userId, ptId);
      const planId = lastInsertRowid;

      const insertItem = db.prepare(`
        INSERT INTO plan_items (plan_id, day, exercise_name, category, sets, reps, pt_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        insertItem.run(planId, item.day || 'Giorno A', item.exercise_name, item.category, item.sets, item.reps, item.pt_notes);
      }
      return planId;
    });

    const planId = transaction();
    res.json({ id: planId });
  });

  app.patch("/api/plan-items/:itemId", (req, res) => {
    const { user_notes } = req.body;
    db.prepare("UPDATE plan_items SET user_notes = ? WHERE id = ?").run(user_notes, req.params.itemId);
    res.json({ success: true });
  });

  // Settings Endpoints
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all() as { key: string, value: string }[];
    const settingsObj = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsObj);
  });

  app.patch("/api/settings", (req, res) => {
    const settings = req.body;
    const updateSetting = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        updateSetting.run(key, value);
      }
    });
    transaction();
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
