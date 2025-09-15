# 🤖 Claude Code Instructions

This file contains instructions for Claude Code to help with the Identity Graph CRM project.

## 📋 Project Overview

This is a production-grade Identity Graph + Journey Tracking CRM system built with:
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **UI**: Tailwind CSS + shadcn/ui components
- **Auth**: NextAuth.js with role-based access
- **Deployment**: Render hosting with Docker support

## 🛠 Common Commands

### Development
```bash
# Start development server
npm run dev

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Create and run migrations
npm run db:seed       # Seed database with sample data
npm run db:studio     # Open Prisma Studio

# Build and deployment
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
```

### Testing the System
```bash
# Install dependencies
npm install

# Set up database (use local PostgreSQL or Supabase)
cp .env.example .env
# Edit .env with your database URL
npm run db:push
npm run db:seed

# Start development
npm run dev
```

## 🎯 Key Features Implemented

### ✅ Phase 1 - Foundation
- **Identity Graph**: Single master profile per user with deduplication
- **Data Ingestion**: API endpoints for clicks, leads, and events
- **Search**: Global search by any identifier
- **Admin UI**: Dashboard with user management
- **Export**: CSV/Excel export functionality
- **Authentication**: Multi-role access system

### 🔄 Phase 2 - Business Features (In Progress)
- **User Profiles**: Detailed user pages with journey timeline
- **Campaign Analytics**: Performance dashboards
- **Fraud Detection**: Automated fraud monitoring
- **Client Portal**: Multi-tenant access
- **Notifications**: Real-time alerts

## 📁 Project Structure

```
crm-system/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API endpoints
│   │   ├── auth/           # Authentication pages
│   │   └── dashboard/      # Admin dashboard
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   └── layout/        # Layout components
│   ├── lib/               # Utility libraries
│   │   ├── prisma.ts      # Database client
│   │   ├── auth.ts        # Authentication config
│   │   ├── user-service.ts # User management logic
│   │   └── export-service.ts # Data export logic
│   └── types/             # TypeScript type definitions
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js           # Database seeding
├── public/               # Static assets
└── deployment files     # Docker, Render config
```

## 🗄️ Database Schema

### Core Tables
- **users**: Master user profiles with identity graph
- **identifiers**: All user identifiers (email, phone, device, etc.)
- **clicks**: Click tracking with attribution data
- **leads**: Form submissions with quality scoring
- **events**: User events (signups, deposits, conversions)
- **campaigns**: Campaign management and analytics
- **clients**: Multi-tenant client management
- **admin_users**: System administrators

## 🔌 API Endpoints

### Data Ingestion
- `POST /api/ingest/click` - Track user clicks
- `POST /api/ingest/lead` - Capture form leads
- `POST /api/ingest/event` - Track user events

### Admin APIs
- `GET /api/search?q={query}` - Search users
- `GET /api/users/{id}` - Get user details
- `GET /api/export?type={type}&format={format}` - Export data
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/health` - Health check

## 🔐 Authentication

### Default Credentials
- **Admin**: admin@todoalrojo.com / admin123
- **Client**: client@example.com / client123

### User Roles
- **SUPER_ADMIN**: Full system access
- **ADMIN**: Most administrative functions
- **ANALYST**: Read-only access with exports
- **VIEWER**: Read-only dashboard access
- **CLIENT**: Access only to their own data

## 📊 Usage Examples

### Track a Click
```bash
curl -X POST http://localhost:3000/api/ingest/click \
  -H "Content-Type: application/json" \
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
curl -X POST http://localhost:3000/api/ingest/lead \
  -H "Content-Type: application/json" \
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

## 🚀 Deployment

### Render Deployment
1. Connect GitHub repository to Render
2. Use included `render.yaml` configuration
3. Set environment variables in Render dashboard
4. Deploy automatically on git push

### Environment Variables
```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret"
JWT_SECRET="your-jwt-secret"
```

## 🔧 Development Tips

### When Working on This Project
1. **Database Changes**: Always run `npm run db:generate` after schema changes
2. **New Components**: Follow the existing shadcn/ui pattern
3. **API Endpoints**: Use Zod for input validation
4. **Styling**: Use Tailwind CSS classes, avoid custom CSS
5. **Types**: Keep TypeScript strict, define interfaces

### Common Tasks
- **Add new API endpoint**: Create in `src/app/api/`
- **Add new page**: Create in `src/app/dashboard/`
- **Add new component**: Create in `src/components/`
- **Database changes**: Edit `prisma/schema.prisma`

### Testing
- Test API endpoints with curl or Postman
- Use Prisma Studio to inspect database
- Check browser console for client-side errors
- Monitor server logs for API errors

## 🐛 Troubleshooting

### Common Issues
1. **Database connection**: Check DATABASE_URL in .env
2. **Authentication**: Verify NEXTAUTH_SECRET is set
3. **Build errors**: Run `npm run lint` to check for issues
4. **Prisma errors**: Run `npm run db:generate` to regenerate client

### Performance
- Database queries are optimized with indexes
- Use pagination for large datasets
- Cache dashboard stats when possible
- Monitor memory usage in production

## 🔮 Next Steps

### Phase 2 Features to Complete
- [ ] Campaign analytics dashboard
- [ ] Advanced fraud detection
- [ ] Client portal implementation
- [ ] Real-time notifications
- [ ] Bulk operations

### Phase 3 Advanced Features
- [ ] Event streaming with Kafka
- [ ] ElasticSearch integration
- [ ] BigQuery/Snowflake connectors
- [ ] Multi-region deployment
- [ ] Advanced ML fraud detection

## 📝 Notes for Claude

When working on this project:
- Follow the existing code patterns and structure
- Use the established UI components from shadcn/ui
- Maintain TypeScript type safety throughout
- Keep database operations in service files
- Use Prisma for all database interactions
- Test API endpoints after implementation
- Update this CLAUDE.md file when adding major features

The system is designed to be production-ready and scalable. Focus on code quality, performance, and user experience when implementing new features.