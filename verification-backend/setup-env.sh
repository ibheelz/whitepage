#!/bin/bash

# Remove existing environment variables
echo "Removing existing environment variables..."
vercel env rm LAAFFIC_API_KEY production --yes 2>/dev/null || true
vercel env rm LAAFFIC_API_SECRET production --yes 2>/dev/null || true
vercel env rm VERIFICATION_SECRET production --yes 2>/dev/null || true
vercel env rm PHONE_VERIFICATION_SECRET production --yes 2>/dev/null || true
vercel env rm VERIFICATION_EXPIRY_MINUTES production --yes 2>/dev/null || true
vercel env rm SMS_FROM production --yes 2>/dev/null || true
vercel env rm EMAIL_FROM production --yes 2>/dev/null || true
vercel env rm RESEND_API_KEY production --yes 2>/dev/null || true

# Add new environment variables
echo "Adding new environment variables..."
echo "wqceXTJa" | vercel env add LAAFFIC_APP_ID production
echo "uj26EVWQ" | vercel env add LAAFFIC_API_KEY production
echo "jVuVHQ0b" | vercel env add LAAFFIC_API_SECRET production
echo "todoalrojo-secret-key-2024-verification-12345" | vercel env add VERIFICATION_SECRET production
echo "346b3kjbl3i4u5fi3yf7802945tbkljbv98svdbv0" | vercel env add PHONE_VERIFICATION_SECRET production
echo "10" | vercel env add VERIFICATION_EXPIRY_MINUTES production
echo "Todo al Rojo" | vercel env add SMS_FROM production
echo "Todo al Rojo no-reply@notifications.todoalrojo.cl" | vercel env add EMAIL_FROM production
echo "re_LyqKcNyY_CxXWVoq3okj8i8g2a6PnGbv6" | vercel env add RESEND_API_KEY production

echo "Environment variables setup complete!"
echo "Now deploying fresh backend..."
vercel --prod