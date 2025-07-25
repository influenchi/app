# Influenchi Platform Architecture

## Overview
Influenchi is a two-sided marketplace connecting brands with content creators (influencers) for marketing campaigns. The platform facilitates campaign creation, creator discovery, collaboration, and payment processing.

## Authentication System

### Technology Stack
- **Better Auth**: Core authentication library
- **PostgreSQL**: Database with UUID primary keys
- **Session-based Auth**: Using secure HTTP-only cookies

### User Types
The platform supports two distinct user types:
1. **Brands** - Companies looking to run influencer marketing campaigns
2. **Creators** - Content creators/influencers who apply to campaigns

### Authentication Flow
```
1. User selects type (Brand/Creator) on homepage
2. Redirected to /signup?type={brand|creator}
3. After signup, redirected to role-specific onboarding
4. Post-onboarding, users access their respective dashboards
```

## Database Schema

### Core Tables

#### Users Table
```sql
users
├── id (UUID, PostgreSQL-generated)
├── email (unique)
├── name
├── emailVerified (boolean)
├── image (optional)
├── user_type ('brand' | 'creator')
├── first_name
├── last_name
├── company_name (for brands)
├── created_at
└── updated_at
```

#### Session & Account Tables
- **session**: Manages user sessions with tokens
- **account**: Links authentication providers (credentials, OAuth)
- **verification**: Handles email verification tokens

### Relationship Tables

#### User Mappings
```sql
user_mappings
├── id (UUID)
├── better_auth_id (text, references users.id)
├── uuid_id (UUID)
└── created_at
```

#### Brand/Creator Profiles
```sql
brands
├── id (UUID)
├── user_id (FK → users.id)
├── company details...
└── onboarding status

creators
├── id (UUID)  
├── user_id (FK → users.id)
├── profile details...
└── verification status
```

## User Workflows

### Brand Workflow

#### 1. Onboarding (`/brand/onboarding`)
Multi-step process to collect:
- Company information
- Brand description
- Campaign types of interest
- Website/social media links
- Logo upload

#### 2. Dashboard (`/brand/dashboard`)
Features:
- Campaign overview cards
- Recent campaign activity
- Quick stats (active campaigns, total creators, etc.)
- Create new campaign button

#### 3. Campaign Creation
Modal-based workflow:
1. **Campaign Basics**
   - Title, description, goals
   - Campaign image upload
   
2. **Target Audience**
   - Demographics
   - Location targeting
   - Creator requirements
   
3. **Content Requirements**
   - Content types needed
   - Posting schedule
   - Brand guidelines
   
4. **Budget & Timeline**
   - Budget amount
   - Payment type (cash/product/service)
   - Start/end dates

#### 4. Campaign Management
- View applicants
- Review creator profiles
- Accept/reject applications
- Message creators
- Track submissions
- Manage payments

### Creator Workflow

#### 1. Onboarding (`/creator/onboarding`)
Multi-step process:
1. **Basic Info**: Display name, bio, location
2. **Social Profiles**: Instagram, TikTok, YouTube links
3. **Niche Selection**: Primary and secondary categories
4. **Audience Info**: Demographics, engagement rates
5. **Portfolio**: Upload work samples

#### 2. Dashboard (`/creator/dashboard`)
Features:
- Available campaigns (filtered by match)
- Application status tracking
- Active projects
- Earnings overview
- Profile completion status

#### 3. Campaign Application
- Browse campaigns
- View detailed requirements
- Submit custom proposal
- Include relevant portfolio pieces
- Set custom pricing (if applicable)

#### 4. Project Execution
- View accepted campaigns
- Submit content for approval
- Track payment status
- Communicate with brands

## Key Features & Interactions

### For Brands
1. **Campaign Discovery**
   - Creators can find campaigns via search/filters
   - Matching algorithm based on niche/audience

2. **Application Management**
   - Table view of all applicants
   - Quick profile preview
   - Bulk actions (accept/reject)

3. **Payment System**
   - Escrow-based payments
   - Milestone tracking
   - Automatic release on approval

### For Creators
1. **Verification System**
   - Social media verification
   - Portfolio review
   - "Vetted" badge for top creators

2. **Smart Matching**
   - Campaigns shown based on:
     - Creator niche
     - Audience demographics
     - Past performance
     - Location

3. **Performance Tracking**
   - Campaign completion rate
   - Average ratings
   - Total earnings

## Technical Implementation Details

### Authentication Setup
```typescript
// lib/auth.ts
- Uses Better Auth with PostgreSQL
- Custom ID generation (UUIDs for users)
- Additional user fields (user_type, names, company)
- Session management with 7-day expiry
```

### State Management
- **Zustand**: For onboarding flows and global state
- **TanStack Query**: For server state and caching
- **React Hook Form + Zod**: For form validation

### API Structure
```
/api/auth/[...all] - Better Auth endpoints
/api/brand/* - Brand-specific endpoints
/api/creator/* - Creator-specific endpoints
/api/campaigns/* - Campaign CRUD operations
/api/upload/* - File upload handlers
```

### Component Architecture
```
/components
├── Auth/          - Login/Signup forms
├── Brand/         - Brand-specific components
│   ├── Dashboard/
│   ├── CreateCampaign/
│   └── Settings/
├── Creator/       - Creator-specific components
│   ├── Dashboard/
│   ├── CampaignDetails/
│   └── Settings/
└── ui/           - Shared UI components (shadcn)
```

## Security Considerations

1. **Authentication**
   - Session-based with secure cookies
   - CSRF protection via Better Auth
   - Password hashing with bcrypt

2. **Authorization**
   - Role-based access (brand vs creator)
   - Resource-level permissions
   - API route protection

3. **Data Protection**
   - Input validation with Zod
   - SQL injection prevention via prepared statements
   - XSS protection through React

## Future Enhancements

1. **Messaging System**
   - Real-time chat between brands and creators
   - Notification system
   - File sharing in chat

2. **Analytics Dashboard**
   - Campaign performance metrics
   - Creator analytics
   - ROI tracking

3. **Payment Integration**
   - Stripe Connect for payouts
   - Multiple currency support
   - Tax documentation

4. **Mobile App**
   - React Native implementation
   - Push notifications
   - Offline capabilities

## Development Guidelines

### Database Migrations
- Use Better Auth CLI for auth-related changes
- Custom migrations in `/scripts` for app-specific tables
- Always backup before major schema changes

### Testing Strategy
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical user flows

### Deployment Considerations
- Environment variables for secrets
- Database connection pooling
- CDN for static assets
- Rate limiting for API endpoints 