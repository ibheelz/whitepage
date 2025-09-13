#!/bin/bash

# Remove all existing environment variables
echo "Removing all existing environment variables..."
vercel env rm LAAFFIC_APP_ID production --yes 2>/dev/null || true
vercel env rm LAAFFIC_API_KEY production --yes 2>/dev/null || true
vercel env rm LAAFFIC_API_SECRET production --yes 2>/dev/null || true
vercel env rm LAAFFIC_SENDER_ID production --yes 2>/dev/null || true
vercel env rm VERIFICATION_SECRET production --yes 2>/dev/null || true
vercel env rm PHONE_VERIFICATION_SECRET production --yes 2>/dev/null || true
vercel env rm VERIFICATION_EXPIRY_MINUTES production --yes 2>/dev/null || true
vercel env rm SMS_FROM production --yes 2>/dev/null || true
vercel env rm EMAIL_FROM production --yes 2>/dev/null || true
vercel env rm RESEND_API_KEY production --yes 2>/dev/null || true

# Add new environment variables using printf to avoid newlines
echo "Adding new environment variables without newlines..."
printf "wqceXTJa" | vercel env add LAAFFIC_APP_ID production
printf "uj26EVWQ" | vercel env add LAAFFIC_API_KEY production
printf "jVuVHQ0b" | vercel env add LAAFFIC_API_SECRET production
printf "Todo al Rojo" | vercel env add LAAFFIC_SENDER_ID production
printf "todoalrojo-secret-key-2024-verification-12345" | vercel env add VERIFICATION_SECRET production
printf "346b3kjbl3i4u5fi3yf7802945tbkljbv98svdbv0" | vercel env add PHONE_VERIFICATION_SECRET production
printf "10" | vercel env add VERIFICATION_EXPIRY_MINUTES production
printf "Todo al Rojo" | vercel env add SMS_FROM production
printf "Todo al Rojo no-reply@notifications.todoalrojo.cl" | vercel env add EMAIL_FROM production
printf "re_LyqKcNyY_CxXWVoq3okj8i8g2a6PnGbv6" | vercel env add RESEND_API_KEY production

echo "Environment variables fixed!"