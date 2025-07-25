export interface SessionUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  // Custom fields added in Better Auth config
  user_type?: 'brand' | 'creator';
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

export interface Session {
  user: SessionUser;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  };
} 