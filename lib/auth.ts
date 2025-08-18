import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { randomUUID } from "crypto";

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    // Allow extra time for cross-region connects and provider jitter
    connectionTimeoutMillis: 15000,
    // Recycle connections periodically to avoid stale sockets
    maxLifetimeSeconds: 300,
    // Keep TCP connections alive to reduce SYN/FIN churn under Fluid concurrency
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Reasonable idle timeout and pool size for a single function instance
    idleTimeoutMillis: 30000,
    max: 10,
    statement_timeout: 10000,
    query_timeout: 10000,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url, token }) => {
      // Use SendGrid templated email
      try {
        await (await import('./email')).sendEmail({
          to: user.email,
          subject: 'Reset your password',
          template: 'password_reset',
          templateData: {
            userId: user.id,
            reset_url: url,
            token,
            email: user.email,
          }
        });
      } catch (err) {
        console.error('Failed sending reset password email', err);
      }
    },
    onPasswordReset: async ({ user }) => {

    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    modelName: "users",
    additionalFields: {
      user_type: {
        type: "string",
        required: false,
        defaultValue: "creator"
      },
      first_name: {
        type: "string",
        required: false
      },
      last_name: {
        type: "string",
        required: false
      },
      company_name: {
        type: "string",
        required: false
      }
    }
  },
  advanced: {
    database: {
      generateId: (options) => {
        // Generate UUIDs for users table
        if (options.model === "user") {
          return randomUUID();
        }
        // Generate text IDs for other tables (Better Auth's default)
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const length = options.size || 32;
        let id = "";
        for (let i = 0; i < length; i++) {
          id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return id;
      }
    }
  }
}); 