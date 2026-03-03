import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, pgEnum, varchar, uuid, real, uniqueIndex, integer } from "drizzle-orm/pg-core";

export const planEnum = pgEnum('plan', ["FREE", 'BASIC', 'PRO', 'BUSINESS', 'ENTERPRISE', 'OS']);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  plan: planEnum("plan").default("FREE").notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const project = pgTable("project", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
export type ProjectType = typeof project.$inferSelect


export const featureStatusEnum = pgEnum("feature_statu", [
  "under_review",
  "planned",
  "in_progress",
  "done",
  "closed",
])

export const feature = pgTable("feature", {
  id: uuid("id").defaultRandom().primaryKey(),

  projectId: text("project_id")
    .notNull()
    .references(() => project.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  status: featureStatusEnum("status")
    .default("under_review")
    .notNull(),
  upvotesCount: integer("upvotes_count").default(0).notNull(),

  authorName: varchar("author_name", { length: 255 }),
  authorEmail: varchar("author_email", { length: 255 }),

  authorId: text("author_id")
    .references(() => user.id, { onDelete: "cascade" }),

  aiSummary: text("ai_summary"),
  priorityScore: real("priority_score"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const upvote = pgTable(
  "upvotes",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    featureId: uuid("feature_id")
      .notNull()
      .references(() => feature.id, { onDelete: "cascade" }),

    voterEmail: varchar("voter_email", { length: 255 }),
    voterToken: varchar("voter_token", { length: 255 }).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  }, (table) => [
    uniqueIndex("unique_feature_voter")
      .on(table.featureId, table.voterToken)
  ]
)

export const comment = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),

  featureId: uuid("feature_id")
    .notNull()
    .references(() => feature.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  authorName: varchar("author_name", { length: 255 }),
  authorId: text("author_id").references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const featureRelations = relations(feature, ({ one, many }) => ({
  project: one(project, {
    fields: [feature.projectId],
    references: [project.id]
  }),
  author: one(user, {
    fields: [feature.authorId],
    references: [user.id]
  }),
  upvotes: many(upvote),
  comments: many(comment),
}))

export const commentRelations = relations(comment, ({ one }) => ({
  author: one(user, {
    fields: [comment.authorId],
    references: [user.id]
  }),
  feature: one(feature, {
    fields: [comment.featureId],
    references: [feature.id]
  })
}))

export const upvoteRelations = relations(upvote, ({ one }) => ({
  features: one(feature, {
    fields: [upvote.featureId],
    references: [feature.id]
  })
}))

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  projects: many(project),
  comments: many(comment)
}));

export const projectRelations = relations(project, ({ one, many }) => ({
  user: one(user, {
    fields: [project.userId],
    references: [user.id]
  }),
  features: many(feature)
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));
