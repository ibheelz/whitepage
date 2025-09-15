# SMS Verification Backend

Production-ready SMS verification system using Laaffic API integration.

## Environment Variables

Configure these environment variables in your Vercel deployment:

### Required Variables
```
LAAFFIC_APP_ID=wqceXTJa
LAAFFIC_API_KEY=uj26EVWQ
LAAFFIC_API_SECRET=jVuVHQ0b
PHONE_VERIFICATION_SECRET=346b3kjbl3i4u5fi3yf7802945tbkljbv98svdbv0
VERIFICATION_SECRET=todoalrojo-secret-key-2024-verification-12345
VERIFICATION_EXPIRY_MINUTES=10
```

### Optional Variables
- `EMAIL_FROM` - Email sender name (Todo al Rojo no-reply@notifications.todoalrojo.cl)
- `RESEND_API_KEY` - Resend API key for email verification
- `SMS_FROM` - SMS sender name (Todo al Rojo)
- `TEST_MODE` - Set to 'true' for testing (default: false in production)

## API Endpoints

### POST /api/phone-verify
#### Send Code
```json
{
  "action": "send-code",
  "phone": "56952059109",
  "countryCode": "+56",
  "language": "es"
}
```

#### Verify Code
```json
{
  "action": "verify-code",
  "verificationId": "token_from_send_response",
  "code": "123456",
  "phone": "56952059109",
  "countryCode": "+56"
}
```

## Testing

### Direct SMS Test
```bash
# Test with specific phone number
node direct-sms-test.js 56952059109

# Test with default number
node direct-sms-test.js
```

### Environment Setup for Testing
```bash
export LAAFFIC_APP_ID="your_app_id"
export LAAFFIC_API_KEY="your_api_key"
export LAAFFIC_API_SECRET="your_api_secret"
export VERIFICATION_SECRET="your-secret-key"
export TEST_MODE="true"
```

## Production Deployment

1. Set environment variables in Vercel dashboard
2. Ensure `TEST_MODE` is not set (will default to false)
3. Deploy using `vercel --prod`

## Form Integration

The system is already integrated with your lead form at `/js/lead-form.js`. The form automatically:

1. Validates phone number format
2. Sends SMS verification code
3. Presents OTP input interface
4. Verifies code before form submission

## Supported Countries

Currently optimized for:
- Chile (+56)
- Nigeria (+234)
- Other countries supported via manual entry

## Security Features

- HMAC-signed verification tokens
- Time-based code expiration
- Rate limiting (built into Laaffic)
- Secure phone number validation