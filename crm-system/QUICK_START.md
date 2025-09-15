# 🚀 Quick Start - CRM System Ready in 5 Minutes!

## Option 1: Supabase (Recommended - Free PostgreSQL Cloud)

### Step 1: Get Database URL (2 minutes)
1. Go to [supabase.com](https://supabase.com)
2. Sign up/login (free account)
3. Create new project
4. Go to Settings > Database
5. Copy the connection string (looks like: `postgresql://postgres:[password]@[host]:5432/postgres`)

### Step 2: Setup CRM (3 minutes)
```bash
cd /Users/bheelz/Desktop/Todoalrojo/crm-system

# Update database URL in .env file
# Replace this line: DATABASE_URL="file:./dev.db"
# With your Supabase URL: DATABASE_URL="postgresql://postgres:..."

# Install and setup
npm install
npm run db:generate
npm run db:push
npm run db:seed

# Start the system
npm run dev
```

### Step 3: Access CRM
- Open: http://localhost:3005
- Login: `abiola@mieladigital.com` / `admin123`

---

## Option 2: Local PostgreSQL

### If you have PostgreSQL installed:
```bash
# Create database
createdb identity_graph_crm

# Update .env with:
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/identity_graph_crm"

# Then run setup commands above
```

---

## 🎯 What You'll See

Once running, you'll have access to:

### 📊 **Main Dashboard** (`/dashboard`)
- Real-time statistics
- Recent user activity
- System overview

### 👥 **User Management** (`/dashboard/users`)
- Global search across all identifiers
- Detailed user profiles with complete journey timelines
- Identity graph visualization

### 📋 **Lead Management** (`/dashboard/leads`)
- Advanced filtering and segmentation
- Quality scoring (0-100%)
- Duplicate detection
- Export to CSV/Excel

### 📈 **Campaign Analytics** (`/dashboard/campaigns`)
- Campaign performance metrics
- Conversion tracking
- Quality scoring
- Fraud rate monitoring

### 📊 **Advanced Analytics** (`/dashboard/analytics`)
- Time series data visualization
- Geographic performance
- Device breakdown
- Hourly activity patterns

### 🛡️ **Fraud Monitor** (`/dashboard/fraud`)
- Real-time fraud detection
- 7 different detection algorithms
- Alert management
- Fraud statistics

### ⚙️ **Settings** (`/dashboard/settings`)
- Webhook management
- System configuration
- Integration setup

### 🏢 **Client Portal** (`/client/dashboard`)
- Restricted client access
- Client-specific analytics
- Export capabilities

---

## 🧪 Test the APIs

### Track a Click:
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

### Capture a Lead:
```bash
curl -X POST http://localhost:3005/api/ingest/lead \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "campaign": "test-campaign",
    "ip": "192.168.1.100"
  }'
```

### Track an Event:
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

---

## 🔥 Features Ready to Explore

✅ **Identity Graph** - Single master profile per user
✅ **Real-time Deduplication** - Across all identifiers
✅ **Fraud Detection** - 7 AI algorithms
✅ **Campaign Analytics** - Performance tracking
✅ **Webhook System** - Real-time integrations
✅ **Multi-role Access** - Admin/Client portals
✅ **Export System** - CSV/Excel with formatting
✅ **Search Engine** - Global identifier search
✅ **Journey Tracking** - Complete user timelines
✅ **Quality Scoring** - Lead quality assessment

---

## ❓ Need Help?

If you get stuck:
1. Check the main README.md
2. Review INSTALLATION.md for detailed setup
3. Check CLAUDE.md for development tips

**This is a production-ready system that can handle millions of users!** 🚀

---

## 🎉 Ready in Under 5 Minutes!

The fastest way is Supabase - just get the database URL and run the setup commands. You'll have a fully functional enterprise CRM system running immediately!