// Debug environment variables
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('LAAFFIC_APP_ID:', process.env.LAAFFIC_APP_ID ? 'Set (' + process.env.LAAFFIC_APP_ID + ')' : 'Missing');
console.log('LAAFFIC_API_KEY:', process.env.LAAFFIC_API_KEY ? 'Set (' + process.env.LAAFFIC_API_KEY + ')' : 'Missing');
console.log('LAAFFIC_API_SECRET:', process.env.LAAFFIC_API_SECRET ? 'Set (' + process.env.LAAFFIC_API_SECRET + ')' : 'Missing');
console.log('LAAFFIC_SENDER_ID:', process.env.LAAFFIC_SENDER_ID ? 'Set (' + process.env.LAAFFIC_SENDER_ID + ')' : 'Missing');
console.log('VERIFICATION_SECRET:', process.env.VERIFICATION_SECRET ? 'Set (' + process.env.VERIFICATION_SECRET + ')' : 'Missing');

const crypto = require("crypto");

// Test signature generation
const timestamp = Math.floor(Date.now() / 1000).toString();
const apiKey = process.env.LAAFFIC_API_KEY || 'uj26EVWQ';
const apiSecret = process.env.LAAFFIC_API_SECRET || 'jVuVHQ0b';
const data = apiKey + apiSecret + timestamp;
const signature = crypto.createHash('md5').update(data).digest('hex');

console.log('\n=== SIGNATURE TEST ===');
console.log('Timestamp:', timestamp);
console.log('API Key:', apiKey);
console.log('API Secret:', apiSecret);
console.log('Data to hash:', data);
console.log('Generated signature:', signature);

module.exports = {};