# Identity Graph + Journey Tracking CRM System

A production-grade CRM system that handles millions of users with identity graph capabilities, journey tracking, and advanced analytics.

## 🚀 Features

### Phase 1 - Foundation (Implemented)
- ✅ **Identity Graph**: Single master profile per user with all identifiers
- ✅ **Data Ingestion**: API endpoints for clicks, leads, and events
- ✅ **Deduplication**: Automatic user merging across identifiers
- ✅ **Search**: Global search by any identifier (email, phone, clickId, deviceId)
- ✅ **Admin UI**: Modern dashboard with Tailwind CSS + shadcn/ui
- ✅ **Export**: CSV/Excel export functionality
- ✅ **Attribution**: First/last click attribution tracking

### Phase 2 - Business Features (Coming Soon)
- 🔄 **Revenue Tracking**: Attach deposits and conversions to users
- 🔄 **Fraud Detection**: VPN detection, duplicate spam prevention
- 🔄 **Campaign Quality**: Scoring and analytics per campaign
- 🔄 **Client Portal**: Multi-tenant access for clients
- 🔄 **Alerts**: Automated fraud and duplicate alerts

### Phase 3 - Advanced Scale (Future)
- 🔄 **Event Streaming**: Kafka/RabbitMQ for real-time processing
- 🔄 **Search Engine**: ElasticSearch for advanced queries
- 🔄 **BI Integration**: BigQuery/Snowflake connectivity
- 🔄 **Multi-Region**: Global deployment capabilities

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui components
- **Auth**: NextAuth.js with role-based access
- **Export**: ExcelJS for advanced Excel exports
- **Deployment**: Render (configured) + Docker support

## 📊 Database Schema

### Core Tables
- **Users**: Master user profiles with identity graph
- **Identifiers**: All user identifiers (email, phone, device, etc.)
- **Clicks**: Click tracking with attribution data
- **Leads**: Form submissions with quality scoring
- **Events**: User events (signups, deposits, conversions)
- **Campaigns**: Campaign management and analytics
- **Clients**: Multi-tenant client management

## 🚀 API Endpoints

### Data Ingestion
- `POST /api/ingest/click` - Track user clicks
- `POST /api/ingest/lead` - Capture form leads
- `POST /api/ingest/event` - Track user events

### Admin APIs
- `GET /api/search?q={query}` - Search users by any identifier
- `GET /api/export?type={type}&format={format}` - Export data (CSV/Excel)
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/health` - Health check endpoint

## 🎯 Usage Examples

### Track a Click
```bash
curl -X POST https://your-domain.com/api/ingest/click \\
  -H "Content-Type: application/json" \\
  -d '{
    "ip": "192.168.1.100",
    "clickId": "click_123",
    "campaign": "summer-2024",
    "source": "google",
    "medium": "cpc",
    "userAgent": "Mozilla/5.0...",
    "landingPage": "https://example.com/landing"
  }'
```

### Capture a Lead
```bash
curl -X POST https://your-domain.com/api/ingest/lead \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "campaign": "summer-2024",
    "ip": "192.168.1.100",
    "value": 50.00
  }'
```

### Track an Event
```bash
curl -X POST https://your-domain.com/api/ingest/event \\
  -H "Content-Type: application/json" \\
  -d '{
    "eventType": "deposit",
    "email": "user@example.com",
    "value": 100.00,
    "currency": "USD",
    "campaign": "summer-2024",
    "isRevenue": true
  }'
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Local Development
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env`)
4. Set up database: `npm run db:push`
5. Seed database: `npm run db:seed`
6. Start development server: `npm run dev`

### Production Deployment on Render
1. Connect your GitHub repository to Render
2. Use the included `render.yaml` configuration
3. Set environment variables in Render dashboard
4. Deploy automatically on git push

## 🔐 Authentication & Roles

### Admin Users
- **SUPER_ADMIN**: Full system access
- **ADMIN**: Most administrative functions
- **ANALYST**: Read-only access with exports
- **VIEWER**: Read-only dashboard access

### Client Users
- **CLIENT**: Access only to their own data

### Default Credentials
- Admin: `admin@todoalrojo.com` / `admin123`
- Client: `client@example.com` / `client123`

## 📈 Dashboard Features

### Global Search
Search users by any identifier:
- Email addresses
- Phone numbers
- Click IDs
- Device IDs
- Session IDs
- Fingerprints

### User Profile Pages
Complete user journey view:
- All identifiers
- Click history
- Lead submissions
- Event timeline
- Attribution data

### Export Functionality
Export data in multiple formats:
- CSV for simple data analysis
- Excel with formatting and charts
- Filtered exports by date, campaign, etc.

## 🛡️ Security Features

- HTTPS-only in production
- SQL injection prevention via Prisma
- Input validation with Zod schemas
- Rate limiting on API endpoints
- Secure session management
- Environment variable protection

## 📊 Performance Features

- Database indexing on key fields
- Efficient pagination
- Connection pooling
- Background job processing ready
- CDN-ready static assets

## 🧪 Quality & Monitoring

- TypeScript for type safety
- Health check endpoints
- Error logging and monitoring
- Data validation at API level
- Audit logging for changes

## 🔮 Roadmap

### Short Term
- Campaign analytics dashboard
- Fraud detection system
- Client portal implementation
- Email notification system

### Medium Term
- Real-time event streaming
- Advanced reporting
- API rate limiting
- Webhook system

### Long Term
- Machine learning fraud detection
- Multi-region deployment
- Advanced BI integrations
- Mobile app

## 📝 License

This project is proprietary software for TodoAlRojo.

## 🤝 Support

For support and questions, contact the development team or open an issue in the repository.