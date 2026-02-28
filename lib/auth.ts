import { betterAuth, GithubProfile } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schema";
import { databaseDrizzle } from "@/db";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(databaseDrizzle, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.user
    }
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      plan: {
        type: "string",
        required: true,
      }
    }
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      mapProfileToUser: (profile) => {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      }
    },
    github: {
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      mapProfileToUser: (profile: GithubProfile) => {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.avatar_url,
        }
      }
    }
  },
});
