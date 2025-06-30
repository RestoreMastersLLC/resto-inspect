# 🛠️ RestoInspect Setup Guide

## Quick Start for Developers

### 1. Environment Variables Setup

Create a `.env.local` file in the project root with these variables:

```bash
# ================================
# CORE APPLICATION SETTINGS
# ================================
NEXT_PUBLIC_APP_NAME=RestoInspect
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_APP_ENV=development

# ================================
# DATABASE CONFIGURATION
# ================================
# Choose ONE of the following:

# Option A: PostgreSQL (Recommended)
DATABASE_URL=postgresql://username:password@localhost:5432/resto_inspect_dev

# Option B: MongoDB
# MONGODB_URI=mongodb://localhost:27017/resto_inspect_dev

# Option C: Supabase (Full-stack solution)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ================================
# AUTHENTICATION
# ================================
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-generate-a-strong-one

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# ================================
# CLOUD STORAGE (AWS S3)
# ================================
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET=resto-inspect-media-dev
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key

# ================================
# GOOGLE MAPS API
# ================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# ================================
# MONITORING & ANALYTICS
# ================================
# Sentry for error tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=GA-MEASUREMENT-ID

# ================================
# EMAIL SERVICE (for notifications)
# ================================
# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Or Amazon SES
# AWS_SES_REGION=us-east-1
# AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# ================================
# PUSH NOTIFICATIONS
# ================================
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key

# ================================
# RATE LIMITING & SECURITY
# ================================
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
BCRYPT_SALT_ROUNDS=12

# ================================
# DEVELOPMENT SETTINGS
# ================================
# Enable/disable features during development
NEXT_PUBLIC_ENABLE_DEBUG=true
NEXT_PUBLIC_ENABLE_MOCK_DATA=false
NEXT_PUBLIC_ENABLE_SERVICE_WORKER=true

# File upload limits
NEXT_PUBLIC_MAX_FILE_SIZE_MB=50
NEXT_PUBLIC_MAX_FILES_PER_INSPECTION=20

# ================================
# PRODUCTION OVERRIDES
# ================================
# These will be different in production:
# NEXT_PUBLIC_APP_ENV=production
# NEXTAUTH_URL=https://yourdomain.com
# DATABASE_URL=postgresql://prod-user:prod-pass@prod-host:5432/resto_inspect
# NEXT_PUBLIC_S3_BUCKET=resto-inspect-media-prod
```

### 2. Database Schema Setup

#### For PostgreSQL:

```sql
-- Create database
CREATE DATABASE resto_inspect_dev;

-- Core tables (run these in order)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'inspector',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status VARCHAR(50) DEFAULT 'draft',
  notes TEXT,
  is_urgent BOOLEAN DEFAULT false,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID REFERENCES inspections(id),
  type VARCHAR(20) NOT NULL, -- 'photo' or 'video'
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  captured_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE owner_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_item_id UUID REFERENCES media_items(id),
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_inspections_user_id ON inspections(user_id);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_media_items_inspection_id ON media_items(inspection_id);
CREATE INDEX idx_owner_info_media_item_id ON owner_info(media_item_id);
```

### 3. AWS S3 Bucket Setup

#### Bucket Configuration:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::resto-inspect-media-dev/*"
    }
  ]
}
```

#### CORS Configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 4. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create API key and restrict it to your domain
5. Add the key to your `.env.local`

### 5. Development Commands

```bash
# Install dependencies
npm install

# Run database migrations (if using Prisma)
npx prisma migrate dev

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

### 6. Folder Structure Creation

Run this script to create the required folder structure:

```bash
mkdir -p src/services src/stores src/hooks src/types src/utils src/__tests__
mkdir -p public/icons public/images
mkdir -p prisma/migrations
```

### 7. Required Dependencies Installation

```bash
# Core dependencies
npm install next@latest react@latest react-dom@latest typescript@latest

# UI and styling
npm install tailwindcss@latest @tailwindcss/forms lucide-react

# State management
npm install zustand

# Authentication
npm install next-auth@latest

# Database (choose one)
npm install prisma @prisma/client  # For PostgreSQL
# OR
npm install mongoose  # For MongoDB
# OR
npm install @supabase/supabase-js  # For Supabase

# AWS SDK
npm install aws-sdk @aws-sdk/client-s3

# Utilities
npm install date-fns clsx

# Development dependencies
npm install --save-dev @types/node @types/react @types/react-dom
npm install --save-dev eslint @typescript-eslint/eslint-plugin
npm install --save-dev prettier eslint-config-prettier
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm install --save-dev husky lint-staged
```

### 8. Git Hooks Setup

```bash
# Install husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# Add pre-push hook
npx husky add .husky/pre-push "npm run type-check && npm test"
```

### 9. VSCode Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html"
  }
}
```

### 10. Initial Testing

After setup, test these features:

- [ ] App loads at `http://localhost:3000`
- [ ] GPS location works (requires HTTPS in production)
- [ ] Camera access works on mobile devices
- [ ] Database connection successful
- [ ] File upload to S3 works
- [ ] Google Maps integration loads

### Troubleshooting

#### Common Issues:

1. **Camera not working**: Ensure HTTPS in production, test on real device
2. **GPS permission denied**: Check browser settings, test location services
3. **S3 upload fails**: Verify CORS settings and IAM permissions
4. **Database connection**: Check connection string and network access
5. **Google Maps not loading**: Verify API key and enabled services

#### Mobile Testing:

- Use Chrome DevTools device emulation
- Test on actual iOS/Android devices
- Check console for permission errors
- Verify touch targets are 44px minimum

---

**Ready to start development? Follow the Implementation Checklist for detailed tasks!**
