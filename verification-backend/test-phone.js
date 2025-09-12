// Local test of phone verification with Chilean number

// Set environment variables FIRST before requiring the module
process.env.LAAFFIC_APP_ID = 'wqceXTJa';
process.env.LAAFFIC_API_KEY = 'uj26EVWQ';
process.env.LAAFFIC_API_SECRET = 'jVuVHQ0b';
process.env.LAAFFIC_SENDER_ID = 'Todo al Rojo';
process.env.VERIFICATION_SECRET = 'todoalrojo-secret-key-2024-verification-12345';
process.env.VERIFICATION_EXPIRY_MINUTES = '10';

console.log('🔧 Environment Check:');
console.log('LAAFFIC_APP_ID:', process.env.LAAFFIC_APP_ID ? 'Set' : 'Missing');
console.log('LAAFFIC_API_KEY:', process.env.LAAFFIC_API_KEY ? 'Set' : 'Missing');
console.log('VERIFICATION_SECRET:', process.env.VERIFICATION_SECRET ? 'Set' : 'Missing');
console.log('');

// NOW require the module
const phoneVerify = require('./api/phone-verify.js');

// Mock request and response objects
const mockReq = {
  method: 'POST',
  body: {
    action: 'send-code',
    phone: '56952059109', // Chilean number that worked before
    language: 'es'
  }
};

const mockRes = {
  setHeader: () => {},
  status: (code) => ({
    json: (data) => {
      console.log(`\n📱 Response Status: ${code}`);
      console.log('📋 Response Data:', JSON.stringify(data, null, 2));
      return { end: () => {} };
    },
    end: () => {}
  })
};

console.log('🧪 Testing Phone Verification with Chilean number...');
console.log('📞 Phone: 56952059109');
console.log('🌐 Language: Spanish');
console.log('───────────────────────────────────────────────────');

// Run the test
phoneVerify(mockReq, mockRes).catch(error => {
  console.error('❌ Test Error:', error);
});