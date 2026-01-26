# SMS OTP Setup Guide

This guide will help you set up real-time SMS OTP delivery using Twilio.

## Prerequisites

- A Twilio account (free trial available)
- A verified phone number (for testing) or a Twilio phone number

## Step 1: Create a Twilio Account

1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Sign up for a free account
3. Verify your email and phone number

## Step 2: Get Your Twilio Credentials

1. Log in to [Twilio Console](https://console.twilio.com/)
2. You'll see your **Account SID** and **Auth Token** on the dashboard
3. Copy these values

## Step 3: Get a Twilio Phone Number

1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Buy a number**
2. Select your country (India: +91)
3. Choose a phone number
4. Complete the purchase (free trial includes credits)

## Step 4: Configure Environment Variables

1. Create a `.env` file in the project root (copy from `.env.example`)
2. Add your Twilio credentials:

```env
SMS_ENABLED=true
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+919876543210
```

**Important:**
- Replace `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` with your actual Account SID
- Replace `your_auth_token_here` with your actual Auth Token
- Replace `+919876543210` with your Twilio phone number (include country code)

## Step 5: Restart Your Server

After updating the `.env` file, restart your backend server:

```bash
npm run server
```

## Step 6: Test SMS Delivery

1. Go to your application: http://localhost:3000
2. Try to sign up or login
3. Enter a phone number
4. Check your phone for the OTP SMS

## Troubleshooting

### SMS Not Sending

1. **Check if SMS is enabled:**
   - Make sure `SMS_ENABLED=true` in your `.env` file
   - Check server logs for "✅ Twilio SMS service initialized"

2. **Verify Twilio credentials:**
   - Double-check your Account SID and Auth Token
   - Make sure there are no extra spaces

3. **Check Twilio Console:**
   - Go to Twilio Console → Monitor → Logs → Messaging
   - Check for any error messages

4. **Phone number format:**
   - Make sure your Twilio phone number includes country code (e.g., +919876543210)
   - The service automatically adds +91 for Indian numbers

### Free Trial Limitations

- Twilio free trial has some limitations
- You can only send SMS to verified phone numbers during trial
- To send to any number, upgrade your account

### Alternative SMS Services

If you prefer other SMS services, you can modify `api/services/OTPService.ts`:

- **AWS SNS** (Amazon Simple Notification Service)
- **TextLocal** (Popular in India)
- **Fast2SMS** (Popular in India)
- **MessageBird**

## Security Notes

1. **Never commit `.env` file to Git**
2. **Keep your Auth Token secret**
3. **Use environment variables in production**
4. **Rotate your credentials regularly**

## Cost Information

- Twilio charges per SMS sent
- India: Approximately ₹0.50 - ₹1.00 per SMS
- Check Twilio pricing for current rates
- Free trial includes $15.50 credit

## Support

- Twilio Documentation: https://www.twilio.com/docs
- Twilio Support: https://support.twilio.com/



