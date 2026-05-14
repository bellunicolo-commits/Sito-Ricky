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
    age INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    weight TEXT,
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
    weight TEXT,
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
try { await db.execute("ALTER TABLE users ADD COLUMN created_at TEXT"); } catch {}
try { await db.execute("UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"); } catch {}
try { await db.execute("ALTER TABLE users ADD COLUMN privacy_accepted_at TEXT"); } catch {}
try { await db.execute("ALTER TABLE users ADD COLUMN health_consent_at TEXT"); } catch {}
try { await db.execute("ALTER TABLE users ADD COLUMN age_confirmed_at TEXT"); } catch {}
try { await db.execute("ALTER TABLE users ADD COLUMN consent_version TEXT"); } catch {}
try { await db.execute("ALTER TABLE exercises ADD COLUMN muscle_group TEXT"); } catch {}
try { await db.execute("ALTER TABLE plan_items ADD COLUMN weight TEXT"); } catch {}
try { await db.execute("ALTER TABLE plan_items ADD COLUMN recovery TEXT"); } catch {}
try { await db.execute("ALTER TABLE plan_items ADD COLUMN notes TEXT"); } catch {}
try { await db.execute("ALTER TABLE model_items ADD COLUMN weight TEXT"); } catch {}
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
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  const PORT = Number(process.env.PORT) || 3000;
  const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? crypto.randomBytes(32).toString("hex") : "fallback_secret_for_dev");
  const CONSENT_VERSION = "2026-05-05";
  const PASSWORD_ERROR = "La password deve contenere almeno 8 caratteri e almeno una lettera maiuscola.";
  const ALLOWED_ORIGIN = "https://coach-bellu-fitplan.onrender.com";

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  const isValidEmail = (value: unknown) =>
    typeof value === "string" &&
    value.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const hasStrongPassword = (value: unknown) =>
    typeof value === "string" && value.length >= 8 && /[A-Z]/.test(value);

  const isAccepted = (value: unknown) =>
    value === true || value === "true" || value === 1 || value === "1" || value === "on";

  const cleanText = (value: unknown, maxLength: number) => {
    if (typeof value !== "string") return "";
    return value.trim().slice(0, maxLength);
  };

  const cleanNullableText = (value: unknown, maxLength: number) => {
    const text = cleanText(value, maxLength);
    return text || null;
  };

  const toId = (value: unknown) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  };

  const getClientIp = (req: any) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
      return forwardedFor.split(",")[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || "unknown";
  };

  app.use((req: any, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
      if (origin === ALLOWED_ORIGIN || process.env.NODE_ENV !== "production") {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Vary", "Origin");
      } else {
        return res.status(403).json({ error: "Origine non consentita" });
      }
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });

  app.use((req: any, res, next) => {
    res.on("finish", () => {
      if (req.path.startsWith("/api") || req.path === "/user") {
        console.log(
          `[ACCESS] ${new Date().toISOString()} ${req.method} ${req.path} ${res.statusCode} ip=${getClientIp(req)} ua="${req.get("user-agent") || ""}"`
        );
      }
    });
    next();
  });

  const loginAttempts = new Map<string, { count: number; resetAt: number }>();
  const loginRateLimit = (req: any, res: any, next: any) => {
    const key = getClientIp(req);
    const now = Date.now();
    const current = loginAttempts.get(key);
    if (!current || current.resetAt <= now) {
      loginAttempts.set(key, { count: 1, resetAt: now + 60_000 });
      return next();
    }
    if (current.count >= 5) {
      return res.status(429).json({ error: "Troppi tentativi. Riprova tra un minuto." });
    }
    current.count += 1;
    loginAttempts.set(key, current);
    next();
  };

  const authenticate = async (req: any, res: any, next: any) => {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null;
    const token = req.cookies?.token || bearer;

    if (!token) {
      return res.status(401).json({ error: "Autenticazione richiesta" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; email: string };
      const userId = toId(decoded.id);
      if (!userId) throw new Error("Invalid token subject");

      const result = await db.execute({
        sql: "SELECT id, email, name, role FROM users WHERE id = ?",
        args: [userId],
      });
      const user = result.rows[0] as any;
      if (!user) throw new Error("User no longer exists");

      req.user = {
        id: Number(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
      };
      next();
    } catch {
      res.clearCookie("token");
      res.status(401).json({ error: "Sessione non valida o scaduta" });
    }
  };

  const requirePt = (req: any, res: any, next: any) => {
    if (req.user?.role !== "pt") {
      return res.status(403).json({ error: "Accesso non consentito" });
    }
    next();
  };

  const canAccessUser = (req: any, userId: number) => req.user?.role === "pt" || req.user?.id === userId;

  const getAssignedCoach = async (athleteId: number) => {
    const fromPlan = await db.execute({
      sql: `
        SELECT u.id, u.name, u.email, u.role, u.bio, u.notification_email, u.email_notifications_enabled
        FROM plans p
        JOIN users u ON u.id = p.pt_id
        WHERE p.user_id = ? AND u.role = 'pt'
        ORDER BY p.id DESC
        LIMIT 1
      `,
      args: [athleteId],
    });
    if (fromPlan.rows.length > 0) return fromPlan.rows[0] as any;

    const fromMessages = await db.execute({
      sql: `
        SELECT u.id, u.name, u.email, u.role, u.bio, u.notification_email, u.email_notifications_enabled
        FROM messages m
        JOIN users u ON u.id = CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END
        WHERE (m.sender_id = ? OR m.receiver_id = ?) AND u.role = 'pt'
        ORDER BY m.id DESC
        LIMIT 1
      `,
      args: [athleteId, athleteId, athleteId],
    });
    if (fromMessages.rows.length > 0) return fromMessages.rows[0] as any;

    const fallback = await db.execute("SELECT id, name, email, role, bio, notification_email, email_notifications_enabled FROM users WHERE role = 'pt' ORDER BY id DESC LIMIT 1");
    return (fallback.rows[0] as any) || null;
  };

  const deleteUserData = async (userId: number) => {
    await db.execute({ sql: "DELETE FROM password_reset_tokens WHERE user_id = ?", args: [userId] });
    await db.execute({ sql: "DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?", args: [userId, userId] });

    const userPlans = await db.execute({ sql: "SELECT id FROM plans WHERE user_id = ? OR pt_id = ?", args: [userId, userId] });
    for (const plan of userPlans.rows as any[]) {
      await db.execute({ sql: "DELETE FROM plan_items WHERE plan_id = ?", args: [plan.id] });
    }
    await db.execute({ sql: "DELETE FROM plans WHERE user_id = ? OR pt_id = ?", args: [userId, userId] });
    await db.execute({ sql: "DELETE FROM users WHERE id = ?", args: [userId] });
  };

  // ✅ Brevo HTTP API - replaces nodemailer SMTP
  const sendMail = async (to: string, subject: string, text: string) => {
    console.log(`[EMAIL] Sending transactional email | Subject: ${subject}`);
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

  app.post("/api/login", loginRateLimit, async (req, res) => {
    const { email, password } = req.body;
    if (!isValidEmail(email) || typeof password !== "string" || !password) {
      return res.status(401).json({ error: "Credenziali non valide" });
    }
    const result = await db.execute({ sql: "SELECT * FROM users WHERE email = ?", args: [email] });
    if (result.rows.length > 0) {
      const user: any = result.rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign({ id: user.id.toString(), role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        delete user.password;
        res.cookie('token', token, cookieOptions);
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
    const genericMessage = "Se l'email e registrata, riceverai le istruzioni per reimpostare la password.";
    if (!isValidEmail(email)) {
      return res.json({ message: genericMessage });
    }
    const result = await db.execute({ sql: "SELECT * FROM users WHERE email = ?", args: [email] });
    const user = result.rows[0] as any;
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 3600000).toISOString();
      await db.execute({ sql: "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)", args: [user.id, token, expires] });
      const resetOrigin = req.headers.origin || process.env.APP_URL || ALLOWED_ORIGIN;
      const resetUrl = `${resetOrigin}/reset-password?token=${token}`;
      await sendMail(email, "Reset Password - Coach Bellu", `Ciao ${user.name}, clicca qui per resettare la tua password: ${resetUrl}`);
    }
    res.json({ message: genericMessage });
  });

  app.post("/api/reset-password", async (req, res) => {
    const { token, password } = req.body;
    if (typeof token !== "string" || token.length < 32) {
      return res.status(400).json({ error: "Token non valido o scaduto" });
    }
    if (!hasStrongPassword(password)) {
      return res.status(400).json({ error: PASSWORD_ERROR });
    }
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

  app.use("/api", (req: any, res: any, next: any) => {
    if (req.method === "POST" && req.path === "/register") return next();
    if (req.method === "GET" && req.path === "/settings") return next();
    return authenticate(req, res, next);
  });

  app.get("/api/me", async (req: any, res) => {
    const result = await db.execute({
      sql: "SELECT id, name, email, role, bio, notification_email, email_notifications_enabled, contract_start, contract_end, experience_years, age, created_at FROM users WHERE id = ?",
      args: [req.user.id],
    });
    if (result.rows.length === 0) return res.status(404).json({ error: "Utente non trovato" });
    res.json(result.rows[0]);
  });

  app.post("/api/messages", async (req: any, res) => {
    const { receiver_id, content } = req.body;
    const senderId = req.user.id;
    let receiverId = toId(receiver_id);
    const safeContent = cleanText(content, 2000);
    if (!receiverId || !safeContent || receiverId === senderId) {
      return res.status(400).json({ error: "Dati messaggio non validi" });
    }
    let receiver = (await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [receiverId] })).rows[0] as any;
    if (!receiver) {
      return res.status(404).json({ error: "Destinatario non trovato" });
    }
    if (req.user.role !== "pt" && receiver.role === "pt") {
      const assignedCoach = await getAssignedCoach(senderId);
      if (assignedCoach) {
        receiverId = Number(assignedCoach.id);
        receiver = assignedCoach;
      }
    }
    if (req.user.role !== "pt" && receiver.role !== "pt") {
      return res.status(403).json({ error: "Accesso non consentito" });
    }
    const result = await db.execute({ sql: "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)", args: [senderId, receiverId, safeContent] });
    const inserted = await db.execute({ sql: "SELECT * FROM messages WHERE id = ?", args: [result.lastInsertRowid] });
    res.json(inserted.rows[0] || { id: result.lastInsertRowid, sender_id: senderId, receiver_id: receiverId, content: safeContent, is_read: 0, created_at: new Date().toISOString() });

    if (receiver && receiver.role === 'pt' && receiver.email_notifications_enabled) {
      const targetEmail = receiver.notification_email || receiver.email;
      void sendMail(targetEmail, "Nuova Notifica - Coach Bellu", `Hai ricevuto un nuovo messaggio da ${req.user.name}: "${safeContent}"`);
    }
  });

  app.get("/api/conversations", async (req: any, res) => {
    const userId = req.user.id;
    if (req.user.role === "pt") {
      const result = await db.execute({
        sql: `
          SELECT
            other_user.id as user_id,
            other_user.name as user_name,
            other_user.email as user_email,
            other_user.role as user_role,
            latest.content as last_message,
            latest.created_at as last_message_at,
            COALESCE(unread.unread_count, 0) as unread_count
          FROM (
            SELECT
              CASE WHEN sender.role = 'user' THEN m.sender_id ELSE m.receiver_id END as other_id,
              MAX(m.id) as last_message_id
            FROM messages m
            JOIN users sender ON sender.id = m.sender_id
            JOIN users receiver ON receiver.id = m.receiver_id
            WHERE (sender.role = 'user' AND receiver.role = 'pt')
               OR (sender.role = 'pt' AND receiver.role = 'user')
            GROUP BY other_id
          ) threads
          JOIN messages latest ON latest.id = threads.last_message_id
          JOIN users other_user ON other_user.id = threads.other_id AND other_user.role = 'user'
          LEFT JOIN (
            SELECT m.sender_id as other_id, COUNT(*) as unread_count
            FROM messages m
            JOIN users receiver ON receiver.id = m.receiver_id
            JOIN users sender ON sender.id = m.sender_id
            WHERE receiver.role = 'pt' AND sender.role = 'user' AND m.is_read = 0
            GROUP BY m.sender_id
          ) unread ON unread.other_id = threads.other_id
          ORDER BY latest.id DESC
        `,
        args: [],
      });
      return res.json(result.rows);
    }

    const result = await db.execute({
      sql: `
        SELECT
          other_user.id as user_id,
          other_user.name as user_name,
          other_user.email as user_email,
          other_user.role as user_role,
          latest.content as last_message,
          latest.created_at as last_message_at,
          COALESCE(unread.unread_count, 0) as unread_count
        FROM (
          SELECT
            CASE WHEN m.sender_id = ? THEN m.receiver_id ELSE m.sender_id END as other_id,
            MAX(m.id) as last_message_id
          FROM messages m
          JOIN users sender ON sender.id = m.sender_id
          JOIN users receiver ON receiver.id = m.receiver_id
          WHERE (m.sender_id = ? AND receiver.role = 'pt')
             OR (m.receiver_id = ? AND sender.role = 'pt')
          GROUP BY other_id
        ) threads
        JOIN messages latest ON latest.id = threads.last_message_id
        JOIN users other_user ON other_user.id = threads.other_id
        LEFT JOIN (
          SELECT sender_id as other_id, COUNT(*) as unread_count
          FROM messages m
          JOIN users sender ON sender.id = m.sender_id
          WHERE receiver_id = ? AND sender.role = 'pt' AND is_read = 0
          GROUP BY sender_id
        ) unread ON unread.other_id = threads.other_id
        ORDER BY latest.id DESC
      `,
      args: [userId, userId, userId, userId],
    });
    res.json(result.rows);
  });

  app.get("/api/messages/:userId", async (req: any, res) => {
    const userId = req.user.id;
    const otherId = toId(req.query.otherId);
    if (!otherId) {
      return res.status(403).json({ error: "Accesso non consentito" });
    }
    const other = (await db.execute({ sql: "SELECT id, role FROM users WHERE id = ?", args: [otherId] })).rows[0] as any;
    if (!other || (req.user.role !== "pt" && other.role !== "pt")) {
      return res.status(403).json({ error: "Accesso non consentito" });
    }

    if (req.user.role === "pt") {
      if (other.role !== "user") {
        return res.status(403).json({ error: "Accesso non consentito" });
      }
      const result = await db.execute({
        sql: `
          SELECT m.*, CASE WHEN sender.role = 'pt' THEN 1 ELSE 0 END as is_mine
          FROM messages m
          JOIN users sender ON sender.id = m.sender_id
          JOIN users receiver ON receiver.id = m.receiver_id
          WHERE (sender.role = 'pt' AND m.receiver_id = ?)
             OR (m.sender_id = ? AND receiver.role = 'pt')
          ORDER BY m.created_at ASC, m.id ASC
        `,
        args: [otherId, otherId],
      });
      return res.json(result.rows);
    }

    const result = await db.execute({
      sql: `
        SELECT m.*, CASE WHEN m.sender_id = ? THEN 1 ELSE 0 END as is_mine
        FROM messages m
        JOIN users sender ON sender.id = m.sender_id
        JOIN users receiver ON receiver.id = m.receiver_id
        WHERE (m.sender_id = ? AND receiver.role = 'pt')
           OR (m.receiver_id = ? AND sender.role = 'pt')
        ORDER BY m.created_at ASC, m.id ASC
      `,
      args: [userId, userId, userId],
    });
    res.json(result.rows);
  });

  app.get("/api/notifications/:userId", async (req: any, res) => {
    const targetId = req.user.id;
    if (req.user.role === "pt") {
      const result = await db.execute({
        sql: `
          SELECT m.*, sender.name as sender_name, sender.role as sender_role
          FROM messages m
          JOIN users sender ON m.sender_id = sender.id
          JOIN users receiver ON m.receiver_id = receiver.id
          WHERE receiver.role = 'pt' AND sender.role = 'user' AND m.is_read = 0
          ORDER BY m.created_at DESC, m.id DESC
        `,
        args: [],
      });
      return res.json(result.rows);
    }

    const result = await db.execute({
      sql: `
        SELECT m.*, u.name as sender_name, u.role as sender_role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.receiver_id = ? AND u.role = 'pt' AND m.is_read = 0
        ORDER BY m.created_at DESC, m.id DESC
      `,
      args: [targetId],
    });
    res.json(result.rows);
  });

  app.get("/api/notifications/full/:userId", async (req: any, res) => {
    const targetId = req.user.id;
    if (req.user.role === "pt") {
      const result = await db.execute({
        sql: `
          SELECT m.*, sender.name as sender_name, sender.role as sender_role
          FROM messages m
          JOIN users sender ON m.sender_id = sender.id
          JOIN users receiver ON m.receiver_id = receiver.id
          WHERE receiver.role = 'pt' AND sender.role = 'user'
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT 100
        `,
        args: [],
      });
      return res.json(result.rows);
    }

    const result = await db.execute({
      sql: `
        SELECT m.*, u.name as sender_name, u.role as sender_role
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.receiver_id = ? AND u.role = 'pt'
        ORDER BY m.created_at DESC, m.id DESC
        LIMIT 100
      `,
      args: [targetId],
    });
    res.json(result.rows);
  });

  app.patch("/api/messages/read", async (req: any, res) => {
    const { senderId } = req.body;
    const receiver = req.user.id;
    const sender = toId(senderId);
    if (!sender) {
      return res.status(403).json({ error: "Accesso non consentito" });
    }
    const senderUser = (await db.execute({ sql: "SELECT id, role FROM users WHERE id = ?", args: [sender] })).rows[0] as any;
    if (!senderUser) {
      return res.status(403).json({ error: "Accesso non consentito" });
    }

    if (req.user.role === "pt" && senderUser.role === "user") {
      await db.execute({
        sql: `
          UPDATE messages
          SET is_read = 1
          WHERE sender_id = ?
            AND receiver_id IN (SELECT id FROM users WHERE role = 'pt')
        `,
        args: [sender],
      });
      return res.json({ success: true });
    }

    if (req.user.role !== "pt" && senderUser.role === "pt") {
      await db.execute({
        sql: `
          UPDATE messages
          SET is_read = 1
          WHERE receiver_id = ?
            AND sender_id IN (SELECT id FROM users WHERE role = 'pt')
        `,
        args: [receiver],
      });
      return res.json({ success: true });
    }

    await db.execute({ sql: "UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?", args: [receiver, sender] });
    res.json({ success: true });
  });

  app.patch("/api/users/:id/notifications", async (req: any, res) => {
    const targetId = toId(req.params.id);
    if (!targetId || targetId !== req.user.id) {
      return res.status(403).json({ error: "Accesso non consentito" });
    }
    const { notification_email, email_notifications_enabled } = req.body;
    if (notification_email && !isValidEmail(notification_email)) {
      return res.status(400).json({ error: "Email non valida" });
    }
    await db.execute({ sql: "UPDATE users SET notification_email = ?, email_notifications_enabled = ? WHERE id = ?", args: [notification_email || null, email_notifications_enabled ? 1 : 0, targetId] });
    res.json({ success: true });
  });

  app.post("/api/register", async (req, res) => {
    const { email, password, name, privacyAccepted, healthConsent, ageConfirmed } = req.body;
    const safeName = cleanText(name, 120);
    if (!safeName || !isValidEmail(email)) {
      return res.status(400).json({ error: "Nome o email non validi" });
    }
    if (!hasStrongPassword(password)) {
      return res.status(400).json({ error: PASSWORD_ERROR });
    }
    if (!isAccepted(privacyAccepted)) {
      return res.status(400).json({ error: "Devi accettare la Privacy Policy per registrarti." });
    }
    if (!isAccepted(healthConsent)) {
      return res.status(400).json({ error: "Devi prestare il consenso esplicito al trattamento dei dati relativi alla salute." });
    }
    if (!isAccepted(ageConfirmed)) {
      return res.status(400).json({ error: "Devi avere almeno 14 anni per usare questo servizio." });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const consentAt = new Date().toISOString();
      const result = await db.execute({
        sql: "INSERT INTO users (email, password, name, role, privacy_accepted_at, health_consent_at, age_confirmed_at, consent_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [email, hashedPassword, safeName, 'user', consentAt, consentAt, consentAt, CONSENT_VERSION]
      });
      const userId = result.lastInsertRowid;
      const token = jwt.sign({ id: userId.toString(), role: 'user', email }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, cookieOptions);
      res.json({ id: userId, email, name: safeName, role: 'user' });
    } catch (err) {
      res.status(400).json({ error: "Email già registrata" });
    }
  });

  app.get("/api/users", requirePt, async (req: any, res) => {
    const result = await db.execute("SELECT id, name, email, role, bio, contract_start, contract_end, experience_years, age, created_at FROM users WHERE role = 'user'");
    res.json(result.rows);
  });

  app.get("/api/coach", async (req: any, res) => {
    const coach = req.user?.role === "user"
      ? await getAssignedCoach(req.user.id)
      : (await db.execute("SELECT id, name, email, role, bio FROM users WHERE role = 'pt' ORDER BY id DESC LIMIT 1")).rows[0];
    if (coach) {
      res.json(coach);
    } else {
      res.status(404).json({ error: "Coach non trovato" });
    }
  });

  app.patch("/api/users/:id", async (req: any, res) => {
    const targetId = toId(req.params.id);
    if (!targetId || !canAccessUser(req, targetId)) {
      return res.status(403).json({ error: "Accesso non consentito" });
    }
    const existing = (await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [targetId] })).rows[0] as any;
    if (!existing) {
      return res.status(404).json({ error: "Utente non trovato" });
    }
    const { name, email, bio, contract_start, contract_end, experience_years, age } = req.body;
    const nextName = name === undefined ? existing.name : cleanText(name, 120);
    const nextEmail = email === undefined ? existing.email : cleanText(email, 254);
    const nextBio = bio === undefined ? existing.bio : cleanText(bio, 1000);
    const nextContractStart = contract_start === undefined ? existing.contract_start : cleanNullableText(contract_start, 40);
    const nextContractEnd = contract_end === undefined ? existing.contract_end : cleanNullableText(contract_end, 40);
    const ageInput = age === undefined ? existing.age : age;
    const experienceInput = experience_years === undefined ? existing.experience_years : experience_years;
    const ageNumber = Number(ageInput);
    const experienceNumber = Number(experienceInput);
    const safeAge = ageInput === "" || ageInput === null || ageInput === undefined || ageNumber === 0 ? null : ageNumber;
    const safeExperience = experienceInput === "" || experienceInput === null || experienceInput === undefined ? null : experienceNumber;
    if (!nextName || !isValidEmail(nextEmail)) {
      return res.status(400).json({ error: "Nome o email non validi" });
    }
    if (safeAge !== null && (!Number.isInteger(safeAge) || safeAge < 14 || safeAge > 120)) {
      return res.status(400).json({ error: "Eta non valida" });
    }
    if (safeExperience !== null && (!Number.isInteger(safeExperience) || safeExperience < 0 || safeExperience > 100)) {
      return res.status(400).json({ error: "Anni di esperienza non validi" });
    }
    try {
      await db.execute({ 
        sql: "UPDATE users SET name = ?, email = ?, bio = ?, contract_start = ?, contract_end = ?, experience_years = ?, age = ? WHERE id = ?", 
        args: [nextName, nextEmail, nextBio, nextContractStart, nextContractEnd, safeExperience, safeAge, targetId]
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

  const deleteOwnAccount = async (req: any, res: any) => {
    await deleteUserData(req.user.id);
    res.clearCookie("token");
    res.json({ success: true });
  };

  app.delete("/api/user", deleteOwnAccount);
  app.delete("/user", authenticate, deleteOwnAccount);

  app.delete("/api/users/:id", requirePt, async (req: any, res) => {
    const targetId = toId(req.params.id);
    if (!targetId || targetId === req.user.id) {
      return res.status(400).json({ error: "Atleta non valido" });
    }
    const target = (await db.execute({ sql: "SELECT id, role FROM users WHERE id = ?", args: [targetId] })).rows[0] as any;
    if (!target || target.role !== "user") {
      return res.status(404).json({ error: "Atleta non trovato" });
    }
    await deleteUserData(targetId);
    res.json({ success: true });
  });

  app.get("/api/exercises", requirePt, async (req, res) => {
    const result = await db.execute("SELECT * FROM exercises ORDER BY category, name");
    res.json(result.rows);
  });

  app.post("/api/exercises", requirePt, async (req: any, res) => {
    const { name, category, muscle_group } = req.body;
    const safeName = cleanText(name, 120);
    const safeCategory = cleanText(category, 80);
    const safeMuscle = cleanText(muscle_group, 80);
    if (!safeName || !safeCategory) return res.status(400).json({ error: "Dati esercizio non validi" });
    const result = await db.execute({ sql: "INSERT INTO exercises (name, category, muscle_group) VALUES (?, ?, ?)", args: [safeName, safeCategory, safeMuscle] });
    res.json({ id: result.lastInsertRowid, name: safeName, category: safeCategory, muscle_group: safeMuscle });
  });

  app.get("/api/models", requirePt, async (req: any, res) => {
    const modelsResult = await db.execute("SELECT * FROM models ORDER BY created_at DESC");
    const models = modelsResult.rows;
    const modelsWithItems = await Promise.all(models.map(async (model: any) => {
      const items = (await db.execute({ sql: "SELECT * FROM model_items WHERE model_id = ?", args: [model.id] })).rows;
      return { ...model, items };
    }));
    res.json(modelsWithItems);
  });
  
  app.get("/api/models/:id/items", requirePt, async (req: any, res) => {
    const items = (await db.execute({ sql: "SELECT * FROM model_items WHERE model_id = ?", args: [req.params.id] })).rows;
    res.json(items);
  });
  
  app.post("/api/models", requirePt, async (req: any, res) => {
    const { name, description, items } = req.body;
    const safeName = cleanText(name, 120);
    const safeDescription = cleanText(description, 1000);
    if (!safeName || !Array.isArray(items)) {
      return res.status(400).json({ error: "Dati modello non validi" });
    }
    const modelResult = await db.execute({ sql: "INSERT INTO models (name, description) VALUES (?, ?)", args: [safeName, safeDescription] });
    const modelId = modelResult.lastInsertRowid;
    for (const item of items) {
      await db.execute({ sql: "INSERT INTO model_items (model_id, day, exercise_name, category, sets, reps, weight, pt_notes, recovery, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [modelId, cleanNullableText(item.day, 40) || 'Giorno A', cleanText(item.exercise_name, 120), cleanText(item.category, 80), cleanNullableText(item.sets, 40), cleanNullableText(item.reps, 40), cleanNullableText(item.weight, 40), cleanNullableText(item.pt_notes, 500) || '', cleanNullableText(item.recovery, 80) || '', cleanNullableText(item.notes, 1000) || ''] as any });
    }
    res.json({ id: modelId });
  });

  app.patch("/api/models/:id", requirePt, async (req: any, res) => {
    const modelId = toId(req.params.id);
    const { name, description, items } = req.body;
    const safeName = cleanText(name, 120);
    const safeDescription = cleanText(description, 1000);
    if (!modelId || !safeName || !Array.isArray(items)) {
      return res.status(400).json({ error: "Dati modello non validi" });
    }
    await db.execute({ sql: "UPDATE models SET name = ?, description = ? WHERE id = ?", args: [safeName, safeDescription, modelId] });
    await db.execute({ sql: "DELETE FROM model_items WHERE model_id = ?", args: [modelId] });
    for (const item of items) {
      await db.execute({ sql: "INSERT INTO model_items (model_id, day, exercise_name, category, sets, reps, weight, pt_notes, recovery, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [modelId, cleanNullableText(item.day, 40) || 'Giorno A', cleanText(item.exercise_name, 120), cleanText(item.category, 80), cleanNullableText(item.sets, 40), cleanNullableText(item.reps, 40), cleanNullableText(item.weight, 40), cleanNullableText(item.pt_notes, 500) || '', cleanNullableText(item.recovery, 80) || '', cleanNullableText(item.notes, 1000) || ''] as any });
    }
    res.json({ success: true });
  });

  app.delete("/api/models/:id", requirePt, async (req: any, res) => {
    await db.execute({ sql: "DELETE FROM model_items WHERE model_id = ?", args: [req.params.id] });
    await db.execute({ sql: "DELETE FROM models WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  });

  app.patch("/api/exercises/:id", requirePt, async (req: any, res) => {
    const { name, category, muscle_group } = req.body;
    const safeName = cleanText(name, 120);
    const safeCategory = cleanText(category, 80);
    const safeMuscle = cleanText(muscle_group, 80);
    if (!safeName || !safeCategory) return res.status(400).json({ error: "Dati esercizio non validi" });
    await db.execute({ sql: "UPDATE exercises SET name = ?, category = ?, muscle_group = ? WHERE id = ?", args: [safeName, safeCategory, safeMuscle, req.params.id] });
    res.json({ success: true });
  });

  app.delete("/api/exercises/:id", requirePt, async (req: any, res) => {
    await db.execute({ sql: "DELETE FROM exercises WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  });

  app.delete("/api/plans/:id", requirePt, async (req: any, res) => {
    await db.execute({ sql: "DELETE FROM plan_items WHERE plan_id = ?", args: [req.params.id] });
    await db.execute({ sql: "DELETE FROM plans WHERE id = ?", args: [req.params.id] });
    res.json({ success: true });
  });

  app.get("/api/plans/:userId/history", async (req: any, res) => {
    const targetId = toId(req.params.userId);
    if (!targetId || !canAccessUser(req, targetId)) {
      return res.status(403).json({ error: "Accesso non consentito" });
    }
    const plans = (await db.execute({ sql: "SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC", args: [targetId] })).rows;
    const plansWithItems = await Promise.all(plans.map(async (plan: any) => {
      const items = (await db.execute({ sql: "SELECT * FROM plan_items WHERE plan_id = ?", args: [plan.id] })).rows;
      return { ...plan, items };
    }));
    res.json(plansWithItems);
  });

  app.get("/api/plans/:userId", async (req: any, res) => {
    const targetId = toId(req.params.userId);
    if (!targetId || !canAccessUser(req, targetId)) {
      return res.status(403).json({ error: "Accesso non consentito" });
    }
    const result = await db.execute({ sql: "SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", args: [targetId] });
    if (result.rows.length === 0) return res.json(null);
    const plan = result.rows[0] as any;
    const items = (await db.execute({ sql: "SELECT * FROM plan_items WHERE plan_id = ?", args: [plan.id] })).rows;
    res.json({ ...plan, items });
  });

  app.post("/api/plans", requirePt, async (req: any, res) => {
    const { userId, ptId, items } = req.body;
    const targetUserId = toId(userId);
    if (!targetUserId || Number(ptId) !== req.user.id) {
      return res.status(400).json({ error: "Dati piano non validi" });
    }
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "Esercizi piano non validi" });
    }
    const planResult = await db.execute({ sql: "INSERT INTO plans (user_id, pt_id) VALUES (?, ?)", args: [targetUserId, req.user.id] });
    const planId = planResult.lastInsertRowid;
    for (const item of items) {
      await db.execute({ sql: "INSERT INTO plan_items (plan_id, day, exercise_name, category, sets, reps, weight, pt_notes, recovery, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [planId, cleanNullableText(item.day, 40) || 'Giorno A', cleanText(item.exercise_name, 120), cleanText(item.category, 80), cleanNullableText(item.sets, 40), cleanNullableText(item.reps, 40), cleanNullableText(item.weight, 40), cleanNullableText(item.pt_notes, 500) || '', cleanNullableText(item.recovery, 80) || '', cleanNullableText(item.notes, 1000) || ''] as any });
    }
    res.json({ id: planId });
  });

  app.patch("/api/plan-items/:itemId", async (req: any, res) => {
    const itemId = toId(req.params.itemId);
    if (!itemId) {
      return res.status(400).json({ error: "Elemento non valido" });
    }
    const ownership = await db.execute({
      sql: "SELECT p.user_id FROM plan_items pi JOIN plans p ON pi.plan_id = p.id WHERE pi.id = ?",
      args: [itemId],
    });
    const row = ownership.rows[0] as any;
    if (!row || (req.user.role !== "pt" && Number(row.user_id) !== req.user.id)) {
      return res.status(403).json({ error: "Accesso non consentito" });
    }
    const { user_notes } = req.body;
    const safeNotes = cleanText(user_notes, 2000);
    await db.execute({ sql: "UPDATE plan_items SET user_notes = ? WHERE id = ?", args: [safeNotes, itemId] });
    res.json({ success: true });
  });

  app.get("/api/settings", async (req, res) => {
    const result = await db.execute("SELECT * FROM settings");
    const settingsObj = result.rows.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    res.json(settingsObj);
  });

  app.patch("/api/settings", requirePt, async (req: any, res) => {
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
