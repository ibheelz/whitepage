// /api/email-verify.js
// Email verification using Resend HTTP API only (no SMTP) with STATELESS signed tokens.
// Works reliably on Vercel across regions (no in-memory dependency).

/**
 * ENV (set in Vercel):
 * - RESEND_API_KEY                (required)
 * - EMAIL_FROM                    (required) e.g. "Todo al Rojo <verify@notifications.todoalrojo.cl>"
 * - VERIFICATION_SECRET           (required) any long random string for HMAC
 * - VERIFICATION_EXPIRY_MINUTES   (optional, default 10)
 */

const crypto = require("crypto");

const CONFIG = {
  RESEND_KEY: process.env.RESEND_API_KEY || process.env.EMAIL_PASS,
  FROM: process.env.EMAIL_FROM,
  EXP_MIN: Number(process.env.VERIFICATION_EXPIRY_MINUTES || 10),
  SECRET: process.env.VERIFICATION_SECRET,
};

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch { return {}; }
}

// --- Base64url helpers ---
function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function b64urlDecode(str) {
  const b64 = String(str).replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, "base64");
}

// --- Stateless token (JWT-like) ---
function sign(payload) {
  if (!CONFIG.SECRET) throw new Error("VERIFICATION_SECRET not set");
  const data = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac("sha256", CONFIG.SECRET).update(data).digest();
  return `${data}.${b64url(sig)}`;
}
function verifyToken(token) {
  if (!CONFIG.SECRET) throw new Error("VERIFICATION_SECRET not set");
  const [data, sig] = String(token || "").split(".");
  if (!data || !sig) return { ok: false, error: "Malformed token" };
  const expected = b64url(crypto.createHmac("sha256", CONFIG.SECRET).update(data).digest());
  if (crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected)) === false) return { ok: false, error: "Bad signature" };
  let payload = null; try { payload = JSON.parse(b64urlDecode(data)); } catch { return { ok: false, error: "Bad payload" }; }
  if (!payload) return { ok: false, error: "Bad payload" };
  if (Date.now() > payload.exp) return { ok: false, error: "Expired" };
  return { ok: true, payload };
}

function code6() { return String(Math.floor(100000 + Math.random() * 900000)); }

function htmlTemplate(c) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
    <div style="background:linear-gradient(135deg,#ef4444,#b91c1c);color:#fff;text-align:center;padding:30px;border-radius:10px 10px 0 0">
      <h1>🎯 Todo al Rojo</h1>
      <p>Verificación de Email</p>
    </div>
    <div style="background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px">
      <h2>¡Hola!</h2>
      <p>Tu código de verificación es:</p>
      <div style="font-size:32px;font-weight:bold;color:#ef4444;text-align:center;background:#fff;padding:20px;border-radius:8px;border:2px dashed #ef4444;margin:20px 0">${c}</div>
      <p><strong>Este código expira en ${CONFIG.EXP_MIN} minutos.</strong></p>
      <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
    </div>
  </div>`;
}

async function resendSend({ to, subject, html, text, from }) {
  if (!CONFIG.RESEND_KEY) throw new Error("RESEND_API_KEY/EMAIL_PASS not set");
  if (!CONFIG.FROM && !from) throw new Error("EMAIL_FROM not set");
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${CONFIG.RESEND_KEY}` },
    body: JSON.stringify({ from: from || CONFIG.FROM, to, subject, html, text }),
  });
  let data = null; try { data = await resp.json(); } catch {}
  if (!resp.ok) {
    const msg = data?.error?.message || data?.message || JSON.stringify(data) || resp.statusText;
    const err = new Error(`Resend API ${resp.status}: ${msg}`); err.status = resp.status; err.resend = data; throw err;
  }
  return data; // { id }
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  const url = req.url || "";

  try {
    if (req.method === "GET") {
      return res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        emailConfig: { provider: "resend-api", from: CONFIG.FROM, expMinutes: CONFIG.EXP_MIN, stateless: true },
      });
    }

    if (req.method === "POST") {
      const body = parseBody(req);
      const action = body.action || (url.includes("send-code") ? "send-code" : url.includes("verify-code") ? "verify-code" : undefined);

      if (action === "send-code") {
        const email = String(body.email || "").trim().toLowerCase();
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!ok) return res.status(400).json({ success: false, error: "Invalid email address" });

        const c = code6();
        const now = Date.now();
        const payload = { email, code: c, iat: now, exp: now + CONFIG.EXP_MIN * 60 * 1000 };
        const verificationId = sign(payload);

        try {
          const info = await resendSend({
            to: email,
            subject: "Código de verificación - Todo al Rojo",
            html: htmlTemplate(c),
            text: `Tu código de verificación es: ${c}. Expira en ${CONFIG.EXP_MIN} minutos.`,
          });
          return res.status(200).json({ success: true, verificationId, expiresAt: payload.exp, id: info.id, message: "Verification code sent" });
        } catch (e) {
          return res.status(500).json({ success: false, error: "Failed to send email", details: e.message, status: e.status, resend: e.resend });
        }
      }

      if (action === "verify-code") {
        const { verificationId, code } = body;
        if (!verificationId || !code) return res.status(400).json({ success: false, valid: false, error: "Missing verification ID or code" });
        const t = verifyToken(verificationId);
        if (!t.ok) return res.status(400).json({ success: false, valid: false, error: t.error });
        const p = t.payload;
        const valid = String(p.code) === String(code);
        return res.status(200).json({ success: true, valid, email: p.email, message: valid ? "Email verified" : "Invalid verification code" });
      }

      return res.status(200).json({ success: true, message: "POST OK", url, body });
    }

    return res.status(404).json({ error: "Not found" });
  } catch (err) {
    console.error("[API] Error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};
