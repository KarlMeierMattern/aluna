import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const pushSubscriptions = pgTable("push_subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  reminderPrefs: jsonb("reminder_prefs").$type<{
    periodDaysBefore: number;
    fertileAlert: boolean;
    dailyNudge: boolean;
  }>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const reminderSchedules = pgTable("reminder_schedule", {
  userId: text("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  nextBleedDate: text("next_bleed_date"),
  fertileWindowStart: text("fertile_window_start"),
  fertileWindowEnd: text("fertile_window_end"),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const partnerLinks = pgTable("partner_link", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  active: boolean("active").default(true).notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  scopes: jsonb("scopes").$type<{
    phase: boolean;
    countdown: boolean;
    fertileWindow: boolean;
  }>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const shareSnapshots = pgTable("share_snapshot", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  cycleDay: integer("cycle_day"),
  phaseName: text("phase_name"),
  phaseEyebrow: text("phase_eyebrow"),
  daysToBleed: integer("days_to_bleed"),
  cycleLen: integer("cycle_len"),
  fertileWindowStart: text("fertile_window_start"),
  fertileWindowEnd: text("fertile_window_end"),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
