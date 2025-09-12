// /api/phone-verify.js
// Phone verification using Laaffic SMS API with STATELESS signed tokens.
// Working system that receives voice calls instead of SMS - needs SMS conversion

const crypto = require("crypto");

const CONFIG = {
  LAAFFIC_APP_ID: process.env.LAAFFIC_APP_ID,
  LAAFFIC_API_KEY: process.env.LAAFFIC_API_KEY,
  LAAFFIC_API_SECRET: process.env.LAAFFIC_API_SECRET,
  LAAFFIC_SENDER_ID: process.env.LAAFFIC_SENDER_ID || 'Todo al Rojo',
  LAAFFIC_BASE_URL: 'https://api.laaffic.com/v3',
  EXP_MIN: Number(process.env.VERIFICATION_EXPIRY_MINUTES || 10),
  SECRET: process.env.VERIFICATION_SECRET,
  // Currently working but sends voice calls instead of SMS
  TEST_MODE: false,
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

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createToken(phone, code) {
  const exp = Date.now() + CONFIG.EXP_MIN * 60 * 1000;
  const payload = JSON.stringify({ phone, code, exp });
  const hmac = crypto.createHmac("sha256", CONFIG.SECRET).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64")}.${hmac}`;
}

function verifyToken(token, phone, code) {
  try {
    const [payloadB64, receivedHmac] = token.split(".");
    const payload = JSON.parse(Buffer.from(payloadB64, "base64").toString());
    
    const expectedHmac = crypto.createHmac("sha256", CONFIG.SECRET).update(Buffer.from(payloadB64, "base64")).digest("hex");
    
    if (receivedHmac !== expectedHmac) return false;
    if (Date.now() > payload.exp) return false;
    if (payload.phone !== phone) return false;
    if (payload.code !== code) return false;
    
    return true;
  } catch {
    return false;
  }
}

function formatPhoneNumber(phone, countryCode = "") {
  // Remove all non-digit characters for Laaffic (no + sign needed)
  let cleanPhone = phone.replace(/\D/g, "");
  
  // If phone already includes country code, use as is
  if (phone.startsWith("+56") || phone.startsWith("56") || 
      phone.startsWith("+234") || phone.startsWith("234")) {
    return phone.replace(/\D/g, ""); // Remove + and any other non-digits
  }
  
  // For Nigerian numbers (detect by length and starting digit)
  if (cleanPhone.length >= 10 && cleanPhone.startsWith("9")) {
    return "234" + cleanPhone;
  }
  
  // For Chilean numbers (9 digits starting with 9)
  if (cleanPhone.length === 9 && cleanPhone.startsWith("9")) {
    return "56" + cleanPhone;
  }
  
  // Default handling
  return cleanPhone;
}

function validatePhoneNumber(phone) {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, "");
  
  // Check if it starts with 56 (Chile) and has proper length
  if (cleanPhone.startsWith("56") && cleanPhone.length >= 10) {
    return true;
  }
  
  // Check if it starts with 234 (Nigeria) and has proper length
  if (cleanPhone.startsWith("234") && cleanPhone.length >= 13) {
    return true;
  }
  
  // Check if it's a local Chilean number (9 digits starting with 9)
  if (cleanPhone.startsWith("9") && cleanPhone.length === 9) {
    return true;
  }
  
  // Check if it's a local Nigerian number (10-11 digits)
  if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
    return true;
  }
  
  return false;
}

function generateLafficSignature(apiKey, apiSecret, timestamp) {
  const data = apiKey + apiSecret + timestamp;
  const signature = crypto.createHash('md5').update(data).digest('hex');
  console.log(`Signature generation: ${apiKey} + ${apiSecret} + ${timestamp} = ${data} -> ${signature}`);
  return signature;
}

async function sendSMS(to, message) {
  if (!CONFIG.LAAFFIC_APP_ID || !CONFIG.LAAFFIC_API_KEY || !CONFIG.LAAFFIC_API_SECRET) {
    throw new Error("Laaffic configuration missing");
  }

  // SMS endpoint - updated to correct Laaffic API endpoint
  const smsEndpoint = `${CONFIG.LAAFFIC_BASE_URL}/sendSms`;

  // Generate Laaffic authentication headers
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = generateLafficSignature(CONFIG.LAAFFIC_API_KEY, CONFIG.LAAFFIC_API_SECRET, timestamp);

  // Use JSON format with correct appId and apiKey
  const requestBody = {
    appId: CONFIG.LAAFFIC_APP_ID,
    numbers: to,
    content: message,
    senderId: CONFIG.LAAFFIC_SENDER_ID,
    orderId: `verify_${Date.now()}`
  };
  
  console.log("Laaffic Debug:");
  console.log("API Key:", CONFIG.LAAFFIC_API_KEY);
  console.log("App ID:", CONFIG.LAAFFIC_APP_ID);
  console.log("Timestamp:", timestamp);
  console.log("Signature:", signature);
  console.log("Request Body:", JSON.stringify(requestBody, null, 2));

  const response = await fetch(smsEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Api-Key": CONFIG.LAAFFIC_API_KEY,
      "Sign": signature,
      "Timestamp": timestamp,
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const error = await response.text();
    console.log("Laaffic HTTP Error:", response.status, error);
    throw new Error(`Laaffic SMS error: ${error}`);
  }

  const result = await response.json();
  console.log("Laaffic Response:", JSON.stringify(result, null, 2));
  
  // Check Laaffic response format
  if (result.status !== "0") {
    throw new Error(`Laaffic SMS failed: ${result.reason || 'Unknown error'} (Status: ${result.status})`);
  }
  
  return {
    success: true,
    message_id: result.id || result.message_id || 'sent',
    status: result.status,
    reason: result.reason
  };
}

function getSuccessMessage(language, code) {
  const messages = {
    es: `Tu codigo de verificacion es ${code}. Valido por ${CONFIG.EXP_MIN} minutos.`,
    en: `Your verification code is ${code}. Valid for ${CONFIG.EXP_MIN} minutes.`,
  };
  return messages[language] || messages.en;
}

module.exports = async (req, res) => {
  cors(res);
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const { action, phone, countryCode, code, verificationId, language = "es" } = parseBody(req);

    if (action === "send-code") {
      if (!phone) {
        return res.status(400).json({ success: false, error: "Phone number required" });
      }

      // Validate phone number (Chilean and Nigerian supported)
      if (!validatePhoneNumber(phone)) {
        return res.status(400).json({ 
          success: false, 
          error: "Invalid phone number format" 
        });
      }

      const formattedPhone = formatPhoneNumber(phone, countryCode);
      const verificationCode = generateCode();
      const token = createToken(formattedPhone, verificationCode);
      
      const message = getSuccessMessage(language, verificationCode);
      
      try {
        console.log(`TEST_MODE config: ${CONFIG.TEST_MODE}`);
        console.log(`LAAFFIC_API_KEY: ${CONFIG.LAAFFIC_API_KEY ? 'Set' : 'Missing'}`);
        console.log(`LAAFFIC_API_SECRET: ${CONFIG.LAAFFIC_API_SECRET ? 'Set' : 'Missing'}`);
        
        if (CONFIG.TEST_MODE) {
          // Test mode: don't actually send SMS, just return success
          console.log(`TEST MODE: Would send SMS to ${formattedPhone}: ${message}`);
        } else {
          console.log(`PRODUCTION MODE: Sending SMS to ${formattedPhone} via Laaffic`);
          // ISSUE: This currently sends VOICE CALLS instead of SMS
          // Need Laaffic support to configure for SMS delivery
          await sendSMS(formattedPhone, message);
        }
        
        return res.status(200).json({
          success: true,
          verificationId: token,
          expiresAt: new Date(Date.now() + CONFIG.EXP_MIN * 60 * 1000).toISOString(),
          message: CONFIG.TEST_MODE ? "Código generado (modo test)" : "Código SMS enviado exitosamente"
        });
      } catch (smsError) {
        console.error("SMS sending error:", smsError);
        return res.status(500).json({
          success: false,
          error: "No se pudo enviar el código SMS",
          details: smsError.message
        });
      }
    }

    if (action === "verify-code") {
      if (!verificationId || !code || !phone) {
        return res.status(400).json({
          success: false,
          error: "Missing verification ID, code, or phone number"
        });
      }

      const formattedPhone = formatPhoneNumber(phone, countryCode);
      const isValid = verifyToken(verificationId, formattedPhone, code);

      if (isValid) {
        return res.status(200).json({
          valid: true,
          success: true,
          message: "Código verificado correctamente"
        });
      } else {
        return res.status(400).json({
          valid: false,
          success: false,
          error: "Código incorrecto o expirado"
        });
      }
    }

    return res.status(400).json({
      success: false,
      error: "Invalid action. Use 'send-code' or 'verify-code'"
    });

  } catch (error) {
    console.error("Phone verification error:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      details: error.message
    });
  }
}