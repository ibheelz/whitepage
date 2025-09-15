# 🚀 Installation Guide - Identity Graph CRM

## 📋 Prerequisites

- **Node.js**: 18.0.0 or higher
- **PostgreSQL**: 15.0 or higher (local or cloud)
- **npm**: 8.0.0 or higher

## ⚡ Quick Start

### 1. Install Dependencies
```bash
cd crm-system
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL
```bash
# Create database
createdb identity_graph_crm

# Set DATABASE_URL in .env
DATABASE_URL="postgresql://username:password@localhost:5432/identity_graph_crm"
```

#### Option B: Supabase (Recommended)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings > Database
4. Update `.env` with your connection string

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
DATABASE_URL="your-database-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
JWT_SECRET="your-jwt-secret"
```

### 4. Database Migration & Seeding
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3005](http://localhost:3005) and sign in with:
- **Admin**: admin@todoalrojo.com / admin123
- **Client**: client@example.com / client123

## 🛠 Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push        # Push schema changes
npm run db:migrate     # Create migration
npm run db:studio      # Open Prisma Studio
npm run db:seed        # Seed sample data

# Code Quality
npm run lint           # Run ESLint
```

## 🎯 Testing the API

### Track a Click
```bash
curl -X POST http://localhost:3005/api/ingest/click \
  -H "Content-Type: application/json" \
  -d '{
    "ip": "192.168.1.100",
    "clickId": "test_click_123",
    "campaign": "test-campaign",
    "source": "google",
    "medium": "cpc",
    "landingPage": "https://example.com/landing"
  }'
```

### Capture a Lead
```bash
curl -X POST http://localhost:3005/api/ingest/lead \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+1234567890",
    "campaign": "test-campaign",
    "ip": "192.168.1.100",
    "value": 50.00
  }'
```

### Track an Event
```bash
curl -X POST http://localhost:3005/api/ingest/event \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "signup",
    "email": "test@example.com",
    "campaign": "test-campaign",
    "value": 100.00,
    "isRevenue": true
  }'
```

## 🚀 Production Deployment

### Render Deployment
1. Push code to GitHub repository
2. Connect to Render dashboard
3. Use included `render.yaml` configuration
4. Set environment variables:
   - `DATABASE_URL` (from Render PostgreSQL)
   - `NEXTAUTH_URL` (your domain)
   - `NEXTAUTH_SECRET` (generate random string)
   - `JWT_SECRET` (generate random string)

### Manual Deployment
```bash
# Build application
npm run build

# Set production environment variables
export NODE_ENV=production
export DATABASE_URL="your-production-db-url"
export NEXTAUTH_URL="https://your-domain.com"

# Start production server
npm start
```

## 📊 Features Overview

### ✅ Implemented Features
- **Identity Graph**: User deduplication across all identifiers
- **Data Ingestion**: Click, lead, and event tracking APIs
- **Admin Dashboard**: User management and analytics
- **Search**: Global search by any identifier
- **Export**: CSV/Excel data export
- **Campaign Analytics**: Performance monitoring
- **Fraud Detection**: Real-time fraud monitoring
- **Client Portal**: Multi-tenant access
- **Authentication**: Role-based access control

### 🎯 Key Endpoints
- `/api/ingest/click` - Track clicks
- `/api/ingest/lead` - Capture leads
- `/api/ingest/event` - Track events
- `/api/search` - Search users
- `/api/export` - Export data
- `/api/fraud/alerts` - Fraud alerts
- `/dashboard` - Admin interface
- `/client/dashboard` - Client portal

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Test database connection
npm run db:studio

# Reset database
npm run db:push --force-reset
npm run db:seed
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npx tsc --noEmit
```

### Authentication Issues
```bash
# Verify environment variables
echo $NEXTAUTH_SECRET
echo $JWT_SECRET

# Clear browser storage and cookies
```

## 📈 Performance Tips

- Use database connection pooling in production
- Enable caching for dashboard statistics
- Implement rate limiting for public APIs
- Monitor memory usage and optimize queries
- Use CDN for static assets

## 🛡️ Security Checklist

- [ ] Change default admin password
- [ ] Set strong NEXTAUTH_SECRET and JWT_SECRET
- [ ] Enable HTTPS in production
- [ ] Configure database firewall rules
- [ ] Implement API rate limiting
- [ ] Monitor fraud detection alerts
- [ ] Regular security updates

## 📞 Support

For issues and questions:
1. Check this installation guide
2. Review the main README.md
3. Check CLAUDE.md for development tips
4. Create GitHub issue if needed

## 🎉 Success!

Once installed, you'll have a production-ready CRM system capable of:
- Handling millions of users
- Real-time fraud detection
- Campaign performance analytics
- Multi-tenant client access
- Comprehensive data export
- Identity graph management

The system is designed to scale and can be extended with additional features as needed.