declare namespace NodeJS {
  export interface ProcessEnv {
    ENV: string
    BETTER_AUTH_SECRET: string
    BETTER_AUTH_URL: string
    DRIZZLE_DATABASE_URL: string
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    AUTH_GITHUB_ID: string
    AUTH_GITHUB_SECRET: string
    RESEND_API_KEY: string
    RESEND_EMAIL: string
    OPENAI_KEY: string,
    OPENAI_ENDPOINT: string,
    REDIS_URL: string,
    OPENAI_AGENT_MODEL: string,
    PADDLE_API_KEY: string
    NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: string
    NEXT_PUBLIC_PADDLE_ENV: 'production' | 'sandbox'
    NEXT_PUBLIC_PADDLE_SCALE_PRICE_ID: string
    NEXT_PUBLIC_PADDLE_GROWTH_PRICE_ID: string
    NEXT_PUBLIC_PADDLE_STARTER_PRICE_ID: string
    NEXT_PUBLIC_PADDLE_SUCCESSURL: string
    PADDLE_NOTIFICATION_WEBHOOK_SECRET: string
    NEXT_PUBLIC_PADDLE_CUSTOMER_PORTAL_URL: string
  }
}
