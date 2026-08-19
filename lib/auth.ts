import { betterAuth, GithubProfile} from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@/db/schema";
import { databaseDrizzle } from "@/db";

const authSecret = process.env.BETTER_AUTH_SECRET;
if (!authSecret) {
  // No hardcoded fallback: a secret committed to a public repo can forge
  // sessions against any deployment that forgets to set its own.
  throw new Error(
    "BETTER_AUTH_SECRET is not set. Set it in your environment before starting the app."
  );
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: authSecret,
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
        defaultValue: process.env.ENV === "OS" ? "OS" : "FREE"
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
          plan: process.env.ENV === "OS" ? "OS" : "FREE"
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
          plan: process.env.ENV === "OS" ? "OS" : "FREE"
        }
      }
    }
  },
});
