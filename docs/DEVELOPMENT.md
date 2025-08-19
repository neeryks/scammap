# Development Guide

## Project Structure

```
scammap/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   └── reports/       # Report endpoints
│   │   ├── incidents/         # Incident listing and details
│   │   ├── report/            # Report submission form
│   │   ├── venues/            # Venue listings
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable UI components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                   # Utilities and configurations
│   │   ├── types.ts          # TypeScript type definitions
│   │   └── utils.ts          # Utility functions
│   └── styles/               # Global styles
├── docs/                     # Documentation
├── public/                   # Static assets
└── tests/                    # Test files
```

## Technology Stack

### Core Framework
- **Next.js 15.4.6**: App router with Turbopack for development
- **React 19**: Latest React with server components
- **TypeScript**: Full type safety throughout the application

### UI Components
- **shadcn/ui**: Modern, accessible component library
- **Radix UI**: Headless UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons

### Data Management
- **Supabase**: PostgreSQL database with real-time features
- **TypeScript Interfaces**: Comprehensive type definitions

### Development Tools
- **ESLint**: Code linting with Next.js configuration
- **Prettier**: Code formatting
- **Turbopack**: Fast bundler for development

## Key Components

### Report Form (`src/app/report/page.tsx`)
The main incident reporting form with conditional fields based on impact type.

**Key Features:**
- Multi-dimensional impact tracking (financial, emotional, time, data)
- Dynamic form fields based on scam category
- File upload with automatic PII redaction
- Real-time validation

**Form Structure:**
```typescript
interface FormData {
  venue: string;
  address: string;
  scamType: Category;
  lossType: 'monetary' | 'emotional' | 'time' | 'data' | 'harassment';
  monetaryAmount?: string;
  emotionalImpact?: 'mild-disappointment' | 'moderate-stress' | 'severe-distress' | 'trauma';
  timeWasted?: 'few-hours' | 'few-days' | 'few-weeks' | 'few-months' | 'over-year';
  personalDataCompromised?: 'basic-info' | 'financial-details' | 'photos-videos' | 'identity-documents';
  description: string;
  evidence?: File;
}
```

### Type System (`src/lib/types.ts`)
Central type definitions for the entire application.

**Key Types:**
```typescript
enum Category {
  DATING_ROMANCE = 'dating-romance',
  INVESTMENT_CRYPTO = 'investment-crypto',
  TECH_SUPPORT = 'tech-support',
  // ... 20+ categories
}

interface Report {
  id: string;
  created_at: string;
  category: Category;
  venue_name: string;
  city: string;
  loss_type: string;
  scam_meter_score: number;
  // ... comprehensive fields
}
```

### Incident Display Components
- **Listing Page**: Shows all incidents with filtering
- **Detail Page**: Individual incident view with enhanced visualization
- **Venue Pages**: Business-specific incident aggregation

## Development Workflow

### Local Development Setup

1. **Environment Setup:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

2. **Database Setup:**
   ```bash
   # Initialize Supabase
   npx supabase init
   npx supabase start
   npx supabase db reset
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```

### Code Standards

#### TypeScript
- All files must be TypeScript (.ts/.tsx)
- Strict type checking enabled
- No `any` types without explicit justification
- Use interfaces for object types, enums for constants

#### React Components
- Functional components with hooks
- Use React 19 features (server components where applicable)
- Props interfaces for all components
- Proper error boundaries for complex components

#### Styling
- Tailwind CSS utility classes
- Component-specific styles in CSS modules when needed
- Consistent spacing using Tailwind scale
- Responsive design mobile-first

#### File Organization
- One component per file
- Index files for clean imports
- Consistent naming conventions (PascalCase for components, camelCase for functions)

### Testing Strategy

#### Unit Tests
```bash
npm run test
```

#### Integration Tests
```bash
npm run test:integration
```

#### E2E Tests
```bash
npm run test:e2e
```

### Database Schema

#### Reports Table
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  venue_name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  loss_type TEXT NOT NULL,
  loss_amount_inr INTEGER,
  emotional_impact TEXT,
  time_wasted TEXT,
  personal_data_compromised TEXT,
  scam_meter_score INTEGER DEFAULT 0,
  verification_status TEXT DEFAULT 'unverified',
  evidence_ids TEXT[],
  tactic_tags TEXT[]
);
```

## Performance Optimization

### Server Components
- Use React Server Components for data fetching
- Minimize client-side JavaScript
- Static generation where possible

### Image Optimization
- Next.js Image component for all images
- Automatic format selection (WebP, AVIF)
- Responsive images with proper sizing

### Bundle Optimization
- Dynamic imports for large components
- Tree shaking enabled
- Minimize external dependencies

## Security Considerations

### Input Validation
- Server-side validation for all inputs
- XSS prevention with proper escaping
- SQL injection prevention with parameterized queries

### File Upload Security
- File type validation
- Size limits enforced
- Virus scanning
- Metadata stripping

### Data Privacy
- PII detection and redaction
- Face blurring in uploaded images
- Secure file storage
- GDPR compliance features

## API Design Principles

### RESTful Routes
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Consistent URL patterns
- Proper status codes

### Error Handling
- Consistent error response format
- Detailed error messages for development
- Generic messages for production

### Rate Limiting
- Per-IP rate limiting
- API key-based rate limiting (future)
- Graceful degradation

## Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
```bash
# Required for production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Monitoring
- Error tracking with error boundaries
- Performance monitoring
- Database query optimization
- User analytics (privacy-compliant)

## Troubleshooting

### Common Issues

1. **TypeScript Errors:**
   - Check interface definitions in `src/lib/types.ts`
   - Ensure proper imports
   - Run `npm run type-check`

2. **Database Connection:**
   - Verify Supabase credentials
   - Check network connectivity
   - Review database logs

3. **Build Failures:**
   - Clear `.next` directory
   - Check for unused imports
   - Verify all dependencies are installed

### Development Tips

1. **Form Development:**
   - Use React DevTools for state debugging
   - Test with various input combinations
   - Validate both client and server-side

2. **Component Development:**
   - Use Storybook for component isolation (future)
   - Test with different props
   - Consider accessibility from the start

3. **Database Development:**
   - Use Supabase Studio for query testing
   - Monitor query performance
   - Set up proper indexes

## Contributing Guidelines

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed contribution guidelines.
