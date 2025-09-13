// Direct SMS test - bypassing Vercel completely
const crypto = require("crypto");

const CONFIG = {
  LAAFFIC_APP_ID: process.env.LAAFFIC_APP_ID || 'wqceXTJa',
  LAAFFIC_API_KEY: process.env.LAAFFIC_API_KEY || 'uj26EVWQ',
  LAAFFIC_API_SECRET: process.env.LAAFFIC_API_SECRET || 'jVuVHQ0b',
  LAAFFIC_SENDER_ID: process.env.LAAFFIC_SENDER_ID || 'Todo al Rojo',
  LAAFFIC_BASE_URL: 'https://api.laaffic.com/v3'
};

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateLafficSignature(apiKey, apiSecret, timestamp) {
  const data = apiKey + apiSecret + timestamp;
  const signature = crypto.createHash('md5').update(data).digest('hex');
  console.log(`Signature: ${apiKey} + ${apiSecret} + ${timestamp} = ${signature}`);
  return signature;
}

async function sendDirectSMS(phone, message) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = generateLafficSignature(CONFIG.LAAFFIC_API_KEY, CONFIG.LAAFFIC_API_SECRET, timestamp);

  const requestBody = {
    appId: CONFIG.LAAFFIC_APP_ID,
    numbers: phone,
    content: message,
    senderId: CONFIG.LAAFFIC_SENDER_ID
  };

  console.log('\n🚀 Direct SMS Test');
  console.log('📞 Phone:', phone);
  console.log('💬 Message:', message);
  console.log('🔐 Timestamp:', timestamp);
  console.log('📋 Request:', JSON.stringify(requestBody, null, 2));

  const response = await fetch(`${CONFIG.LAAFFIC_BASE_URL}/sendSms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=UTF-8",
      "Api-Key": CONFIG.LAAFFIC_API_KEY,
      "Sign": signature,
      "Timestamp": timestamp,
    },
    body: JSON.stringify(requestBody)
  });

  const result = await response.json();
  console.log('\n📱 Laaffic Response:');
  console.log(JSON.stringify(result, null, 2));
  
  return result;
}

// Dynamic SMS test - accepts phone number as command line argument
async function runTest() {
  try {
    // Get phone number from command line argument or prompt for input
    const phone = process.argv[2] || '56952059109'; // Default for testing

    if (!phone || phone.length < 8) {
      console.log('\n❌ Please provide a valid phone number');
      console.log('Usage: node direct-sms-test.js [phone_number]');
      console.log('Example: node direct-sms-test.js 56952059109');
      return;
    }

    const code = generateCode();
    const message = `Tu codigo de verificacion es ${code}. Valido por 10 minutos.`;

    console.log('='.repeat(60));
    console.log('🧪 DIRECT SMS TEST (No Vercel)');
    console.log('='.repeat(60));

    const result = await sendDirectSMS(phone, message);

    if (result.status === "0") {
      console.log(`\n✅ SUCCESS: Code ${code} sent to ${phone}`);
      console.log(`📨 Message ID: ${result.array[0]?.msgId}`);
    } else {
      console.log(`\n❌ FAILED: ${result.reason || 'Unknown error'}`);
    }

  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
  }
}

runTest();