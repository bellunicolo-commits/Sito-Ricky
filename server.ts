import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// BigInt serialization support
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const db = createClient({
  url: process.env.TURSO_URL || "file:fitplan.db",
  authToken: process.env.TURSO_TOKEN,
});

// Initialize Database
await db.executeMultiple(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    role TEXT CHECK(role IN ('pt', 'user')),
    bio TEXT,
    notification_email TEXT,
    email_notifications_enabled INTEGER DEFAULT 1,
    contract_start TEXT,
    contract_end TEXT,
    experience_years INTEGER,
    age INTEGER
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
    category TEXT,
    muscle_group TEXT
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
    recovery TEXT,
    notes TEXT,
    FOREIGN KEY(plan_id) REFERENCES plans(id)
  );
  CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS model_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER,
    day TEXT,
    exercise_name TEXT,
    category TEXT,
    sets TEXT,
    reps TEXT,
    pt_notes TEXT,
    recovery TEXT,
    notes TEXT,
    FOREIGN KEY(model_id) REFERENCES models(id)
  );
`);

// Migrations
try { await db.execute("ALTER TABLE plan_items ADD COLUMN day TEXT DEFAULT 'Giorno A'"); } catch {}
try { await db.execute("ALTER TABLE users ADD COLUMN bio TEXT"); } catch {}
try { await db.execute("ALTER TABLE users ADD COLUMN notification_email TEXT"); } catch {}
try { await db.execute("ALTER TABLE users ADD COLUMN email_notifications_enabled INTEGER DEFAULT 1"); } catch {}
try { await db.execute("ALTER TABLE users ADD COLUMN contract_start TEXT"); } catch {}
try { await db.execute("ALTER TABLE users ADD COLUMN contract_end TEXT"); } catch {}
try { await db.execute("ALTER TABLE users ADD COLUMN experience_years INTEGER"); } catch {}
try { await db.execute("ALTER TABLE users ADD COLUMN age INTEGER"); } catch {}
try { await db.execute("ALTER TABLE exercises ADD COLUMN muscle_group TEXT"); } catch {}
try { await db.execute("ALTER TABLE plan_items ADD COLUMN recovery TEXT"); } catch {}
try { await db.execute("ALTER TABLE plan_items ADD COLUMN notes TEXT"); } catch {}
try { await db.execute("ALTER TABLE model_items ADD COLUMN recovery TEXT"); } catch {}
try { await db.execute("ALTER TABLE model_items ADD COLUMN notes TEXT"); } catch {}

// Seed initial data - INSERT OR IGNORE prevents duplicates on restart
const ptHash = await bcrypt.hash("password", 10);
const userHash = await bcrypt.hash("password", 10);
await db.execute({ sql: "INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)", args: ["pt@coachbellu.com", ptHash, "Coach Bellu", "pt"] });
await db.execute({ sql: "INSERT OR IGNORE INTO users (email, password, name, role) VALUES (?, ?, ?, ?)", args: ["user@coachbellu.com", userHash, "Luca Cliente", "user"] });

const userCount = await db.execute("SELECT count(*) as count FROM users");
if ((userCount.rows[0] as any).count <= 2) {

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

  const exCount = await db.execute("SELECT count(*) as count FROM exercises");
  if ((exCount.rows[0] as any).count === 0) {
    for (const ex of exercises) {
      await db.execute({ sql: "INSERT INTO exercises (name, category) VALUES (?, ?)", args: [ex.name, ex.category] });
    }
  }

  const seedSettings = [
    { key: 'about_title', value: 'Pietro Cassago' },
    { key: 'about_subtitle', value: 'Performance Elite' },
    { key: 'about_description', value: "Coach Bellu. Specialista in Calisthenics, Strength & Conditioning. Trasformo atleti attraverso un approccio scientifico e una programmazione d'élite personalizzata." },
    { key: 'about_specialty', value: 'Calisthenics' },
    { key: 'about_focus', value: 'Performance' },
    { key: 'about_standard', value: 'Elite' },
    { key: 'about_image', value: 'https://picsum.photos/seed/coachbellu/800/800' }
  ];
  for (const s of seedSettings) {
    await db.execute({ sql: "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)", args: [s.key, s.value] });
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  const PORT = Number(process.env.PORT) || 3000;
  const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";

  // Simplified authenticate for dev - no-op to avoid breaking routes but not checking tokens
  const authenticate = (req: any, res: any, next: any) => next();

  // ✅ Brevo HTTP API - replaces nodemailer SMTP
  const sendMail = async (to: string, subject: string, text: string) => {
    console.log(`[EMAIL] Sending to: ${to} | Subject: ${subject}`);
    if (!process.env.BREVO_API_KEY) {
      console.log("[EMAIL] No BREVO_API_KEY set, skipping email.");
      return;
    }
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: "Coach Bellu", email: "bellunicolo@gmail.com" },
          to: [{ email: to }],
          subject: subject,
          textContent: text,
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        console.error("[EMAIL] Brevo error:", err);
      } else {
        console.log("[EMAIL] Sent successfully via Brevo API");
      }
    } catch (err) {
      console.error("[EMAIL] Error sending email:", err);
    }
  };

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const result = await db.execute({ sql: "SELECT * FROM users WHERE email = ?", args: [email] });
    if (result.rows.length > 0) {
      const user: any = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ id: user.id.toString(), role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        delete user.password;
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
        res.json(user);
      } else {
        res.status(401).json({ error: "Credenziali non valide" });
      }
    } else {
      res.status(401).json({ error: "Credenziali non valide" });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });



  app.post("/api/forgot-password", async (req, res) => {
    const { email } = req.body;
    const result = await db.execute({ sql: "SELECT * FROM users WHERE email = ?", args: [email] });
    const user = result.rows[0] as any;
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 3600000).toISOString();
      await db.execute({ sql: "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", args: [user.id, token, expires] });
      const resetUrl = `${req.headers.origin}/reset-password?token=${token}`;
      await sendMail(email, "Reset Password - Coach Bellu", `Ciao ${user.name}, clicca qui per resettare la tua password: ${resetUrl}`);
      res.json({ message: "Email di recupero inviata con successo!" });
    } else {
      res.status(404).json({ error: "Email non trovata" });
    }
  });

  app.post("/api/reset-password", async (req, res) => {
    const { token, password } = req.body;
    const result = await db.execute({ sql: "SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > ?", args: [token, new Date().toISOString()] });
    const resetToken = result.rows[0] as any;
    if (resetToken) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.execute({ sql: "UPDATE users SET password = ? WHERE id = ?", args: [hashedPassword, resetToken.user_id] });
      await db.execute({ sql: "DELETE FROM password_reset_tokens WHERE id = ?", args: [resetToken.id] });
      res.json({ message: "Password aggiornata con successo!" });
    } else {
      res.status(400).json({ error: "Token non valido o scaduto" });
    }
  });

  app.post("/api/messages", async (req: any, res) => {
    const { sender_id, receiver_id, content } = req.body;
    const result = await db.execute({ sql: "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)", args: [sender_id, receiver_id, content] });
    const receiver = (await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [receiver_id] })).rows[0] as any;
    if (receiver && receiver.role === 'pt' && receiver.email_notifications_enabled) {
      const sender = (await db.execute({ sql: "SELECT name FROM users WHERE id = ?", args: [sender_id] })).rows[0] as any;
      const targetEmail = receiver.notification_email || receiver.email;
      await sendMail(targetEmail, "Nuova Notifica - Coach Bellu", `Hai ricevuto un nuovo messaggio da ${sender.name}: "${content}"`);
    }
    res.json({ id: result.lastInsertRowid, sender_id, receiver_id, content });
  });

  app.get("/api/messages/:userId", async (req: any, res) => {
    const { userId } = req.params;
    const { otherId } = req.query;
    const result = await db.execute({ sql: `SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC`, args: [userId, otherId as string, otherId as string, userId] });
    res.json(result.rows);
  });

  app.get("/api/notifications/:userId", async (req: any, res) => {
    const targetId = req.params.userId;
    const result = await db.execute({ sql: `SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.receiver_id = ? AND m.is_read = 0 ORDER BY m.created_at DESC`, args: [targetId] });
    res.json(result.rows);
  });

  app.patch("/api/messages/read", async (req: any, res) => {
    const { receiverId, senderId } = req.body;
    await db.execute({ sql: "UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?", args: [receiverId, senderId] });
    res.json({ success: true });
  });

  app.patch("/api/users/:id/notifications", async (req: any, res) => {
    const { notification_email, email_notifications_enabled } = req.body;
    await db.execute({ sql: "UPDATE users SET notification_email = ?, email_notifications_enabled = ? WHERE id = ?", args: [notification_email, email_notifications_enabled ? 1 : 0, req.params.id] });
    res.json({ success: true });
  });

  app.post("/api/register", async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.execute({ sql: "INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)", args: [email, hashedPassword, name, 'user'] });
      const userId = result.lastInsertRowid;
      const token = jwt.sign({ id: userId.toString(), role: 'user', email }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
      res.json({ id: userId, email, name, role: 'user' });
    } catch (err) {
      res.status(400).json({ error: "Email già registrata" });
    }
  });

  app.get("/api/users", async (req: any, res) => {
    const result = await db.execute("SELECT id, name, email, role, bio, contract_start, contract_end, experience_years, age FROM users WHERE role = 'user'");
    res.json(result.rows);
  });

  app.get("/api/coach", async (req, res) => {
    const result = await db.execute("SELECT id, name, email, role, bio FROM users WHERE role = 'pt' LIMIT 1");
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Coach non trovato" });
    }
  });

  app.patch("/api/users/:id", async (req: any, res) => {
    const { name, email, bio, contract_start, contract_end, experience_years, age } = req.body;
    try {
      await db.execute({ 
        sql: "UPDATE users SET name = ?, email = ?, bio = ?, contract_start = ?, contract_end = ?, experience_years = ?, age = ? WHERE id = ?", 
        args: [name, email, bio, contract_start, contract_end, experience_years, age, req.params.id] 
      });
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: "Email già in uso o dati non validi" });
    }
  });

  // Clean up duplicate exercises on startup
  try {
    const allEx = await db.execute("SELECT id, name FROM exercises");
    const seen = new Set();
    for (const ex of allEx.rows as any[]) {
      if (seen.has(ex.name)) {
        await db.execute({ sql: "DELETE FROM exercises WHERE id = ?", args: [ex.id] });
      } else {
        seen.add(ex.name);
      }
    }
  } catch (err) {
    console.error("Error cleaning up exercises:", err);
  }

  app.delete("/api/users/:id", async (req: any, res) => {
    const plansResult = await db.execute({ sql: "SELECT id FROM plans WHERE user_id = ?", args: [req.params.id] });
    const plans = plansResult.rows as unknown as { id: number }[];
    for (const plan of plans) {
      await db.execute({ sql: "DELETE FROM plan_items WHERE plan_id = ?", args: [plan.id] });
    }
    await db.execute({ sql: "DELETE FROM plans WHERE user_id = ?", args: [req.params.id] });
    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  });

  app.get("/api/exercises", async (req, res) => {
    const result = await db.execute("SELECT * FROM exercises ORDER BY category, name");
    res.json(result.rows);
  });

  app.post("/api/exercises", async (req: any, res) => {
    const { name, category, muscle_group } = req.body;
    const result = await db.execute({ sql: "INSERT INTO exercises (name, category, muscle_group) VALUES (?, ?, ?)", args: [name, category, muscle_group] });
    res.json({ id: result.lastInsertRowid, name, category, muscle_group });
  });

  app.get("/api/models", async (req: any, res) => {
    const modelsResult = await db.execute("SELECT * FROM models ORDER BY created_at DESC");
    const models = modelsResult.rows;
    const modelsWithItems = await Promise.all(models.map(async (model: any) => {
      const items = (await db.execute({ sql: "SELECT * FROM model_items WHERE model_id = ?", args: [model.id] })).rows;
      return { ...model, items };
    }));
    res.json(modelsWithItems);
  });
  
  app.get("/api/models/:id/items", async (req: any, res) => {
    const items = (await db.execute({ sql: "SELECT * FROM model_items WHERE model_id = ?", args: [req.params.id] })).rows;
    res.json(items);
  });
  
  app.post("/api/models", async (req: any, res) => {
    const { name, description, items } = req.body;
    const modelResult = await db.execute({ sql: "INSERT INTO models (name, description) VALUES (?, ?)", args: [name, description] });
    const modelId = modelResult.lastInsertRowid;
    for (const item of items) {
      await db.execute({ sql: "INSERT INTO model_items (model_id, day, exercise_name, category, sets, reps, pt_notes, recovery, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [modelId, item.day || 'Giorno A', item.exercise_name, item.category, item.sets, item.reps, item.pt_notes || '', item.recovery || '', item.notes || ''] as any });
    }
    res.json({ id: modelId });
  });

  app.delete("/api/models/:id", async (req: any, res) => {
    await db.execute({ sql: "DELETE FROM model_items WHERE model_id = ?", args: [req.params.id] });
    await db.execute({ sql: "DELETE FROM models WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  });

  app.patch("/api/exercises/:id", async (req: any, res) => {
    const { name, category, muscle_group } = req.body;
    await db.execute({ sql: "UPDATE exercises SET name = ?, category = ?, muscle_group = ? WHERE id = ?", args: [name, category, muscle_group, req.params.id] });
    res.json({ success: true });
  });

  app.delete("/api/exercises/:id", async (req: any, res) => {
    await db.execute({ sql: "DELETE FROM exercises WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  });

  app.delete("/api/plans/:id", async (req: any, res) => {
    await db.execute({ sql: "DELETE FROM plan_items WHERE plan_id = ?", args: [req.params.id] });
    await db.execute({ sql: "DELETE FROM plans WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  });

  app.get("/api/plans/:userId/history", async (req: any, res) => {
    const targetId = req.params.userId;
    const plans = (await db.execute({ sql: "SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC", args: [targetId] })).rows;
    const plansWithItems = await Promise.all(plans.map(async (plan: any) => {
      const items = (await db.execute({ sql: "SELECT * FROM plan_items WHERE plan_id = ?", args: [plan.id] })).rows;
      return { ...plan, items };
    }));
    res.json(plansWithItems);
  });

  app.get("/api/plans/:userId", async (req: any, res) => {
    const targetId = req.params.userId;
    const result = await db.execute({ sql: "SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", args: [targetId] });
    if (result.rows.length === 0) return res.json(null);
    const plan = result.rows[0] as any;
    const items = (await db.execute({ sql: "SELECT * FROM plan_items WHERE plan_id = ?", args: [plan.id] })).rows;
    res.json({ ...plan, items });
  });

  app.post("/api/plans", async (req: any, res) => {
    const { userId, ptId, items } = req.body;
    const planResult = await db.execute({ sql: "INSERT INTO plans (user_id, pt_id) VALUES (?, ?)", args: [userId, ptId] });
    const planId = planResult.lastInsertRowid;
    for (const item of items) {
      await db.execute({ sql: "INSERT INTO plan_items (plan_id, day, exercise_name, category, sets, reps, pt_notes, recovery, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [planId, item.day || 'Giorno A', item.exercise_name, item.category, item.sets, item.reps, item.pt_notes || '', item.recovery || '', item.notes || ''] as any });
    }
    res.json({ id: planId });
  });

  app.patch("/api/plan-items/:itemId", async (req: any, res) => {
    const { user_notes } = req.body;
    await db.execute({ sql: "UPDATE plan_items SET user_notes = ? WHERE id = ?", args: [user_notes, req.params.itemId] });
    res.json({ success: true });
  });

  app.get("/api/settings", async (req, res) => {
    const result = await db.execute("SELECT * FROM settings");
    const settingsObj = result.rows.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsObj);
  });

  app.patch("/api/settings", async (req: any, res) => {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await db.execute({ sql: "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", args: [key, value as any] });
    }
    res.json({ success: true });
  });

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
