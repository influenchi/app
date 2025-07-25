# Influenchi Development Guide

## Quick Reference
For detailed architecture and workflows, see [ARCHITECTURE.md](./ARCHITECTURE.md)

## Commands
- **Dev**: `npm run dev` (Next.js with Turbopack)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Start**: `npm start`

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Auth**: Better Auth with PostgreSQL
- **Database**: Supabase (PostgreSQL)
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Email**: Resend
- **Analytics**: Amplitude

## Code Style Guidelines
- Use `@/` path alias for imports from src root
- Components: PascalCase with TypeScript interfaces
- Use `cn()` utility for className merging
- Prefer `const` assertions and `React.forwardRef`
- Use CVA for component variants
- Double quotes for strings, semicolons required

## Project Structure
```
/app              # Next.js pages and API routes
  /api            # API endpoints
  /brand          # Brand-specific pages
  /creator        # Creator-specific pages
  /(auth)         # Auth pages (login/signup)
  
/components       # Reusable components
  /Auth           # Authentication components
  /Brand          # Brand-specific components
  /Creator        # Creator-specific components
  /ui             # shadcn/ui base components
  
/lib              # Utilities and configurations
  /auth           # Auth setup and config
  /hooks          # Custom React hooks
  /validations    # Zod schemas
  /utils          # Helper functions
```

## Database Notes
- Users table uses PostgreSQL-generated UUIDs
- Session/Account tables use Better Auth text IDs
- Run migrations: `npx @better-auth/cli migrate`
- Generate schema: `npx @better-auth/cli generate`

## Quick Tips
1. Check user type with `session.user.user_type`
2. Protected routes should verify user role
3. Use `useAuth()` hook for auth state
4. File uploads go through Supabase Storage
5. All forms should have Zod validation

## Common Patterns
```typescript
// Protected API route
const session = await auth.getSession(request);
if (!session || session.user.user_type !== 'brand') {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

// Client-side auth check
const { data: session } = useSession();
if (!session) redirect('/login');
```
