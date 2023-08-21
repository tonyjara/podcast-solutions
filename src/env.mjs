import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string().min(1) : z.string().url(),
    ),
    // Add `.min(1) on ID and SECRET if you want to make sure they're not empty

    JWT_SECRET: z.string().min(1),

    RE_CAPTCHA_SECRET_KEY: z.string().min(1),

    OPENAI_API_KEY: z.string().min(1),

    MAILERSEND_API_TOKEN: z.string().min(1),

    STORAGE_RESOURCE_NAME: z.string().min(1),
    AZURE_STORAGE_ACCESS_KEY: z.string().min(1),

    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    DEEPGRAM_API_KEY: z.string().min(1),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL: z.string().min(1),
    NEXT_PUBLIC_WEB_URL: z.string().min(1),
    NEXT_PUBLIC_RE_CAPTCHA_SITE_KEY: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,

    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,

    JWT_SECRET: process.env.JWT_SECRET,

    NEXT_PUBLIC_RE_CAPTCHA_SITE_KEY:
      process.env.NEXT_PUBLIC_RE_CAPTCHA_SITE_KEY,
    RE_CAPTCHA_SECRET_KEY: process.env.RE_CAPTCHA_SECRET_KEY,

    OPENAI_API_KEY: process.env.OPENAI_API_KEY,

    MAILERSEND_API_TOKEN: process.env.MAILERSEND_API_TOKEN,

    STORAGE_RESOURCE_NAME: process.env.STORAGE_RESOURCE_NAME,
    AZURE_STORAGE_ACCESS_KEY: process.env.AZURE_STORAGE_ACCESS_KEY,

    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL:
      process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL,
    DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
