import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

const sentimentEnum = pgEnum("sentiment", ["good", "medium", "bad"]);

export type Sentiment = "good" | "medium" | "bad";

export const exerciseSelection = pgTable("exercise_selection", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  category: text("category"), // "compound" | "isolation"
  primaryMuscleGroup: text("primary_muscle_group").notNull(),
  secondaryMuscleGroup: text("secondary_muscle_group"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export type NewExerciseSelection = typeof exerciseSelection.$inferInsert;
export type ExerciseSelection = typeof exerciseSelection.$inferSelect;

export const workout = pgTable("workout", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  sentiment: sentimentEnum("sentiment").default("medium").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export type NewWorkout = typeof workout.$inferInsert;
export type DBWorkout = typeof workout.$inferSelect;

export const exercise = pgTable("exercise", {
  id: uuid("id").primaryKey().defaultRandom(),
  note: text("note"),
  order: integer("order").notNull(),
  repLowerBound: integer("rep_lower_bound"),
  repUpperBound: integer("rep_upper_bound"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  workoutId: uuid("workout_id")
    .notNull()
    .references(() => workout.id, { onDelete: "cascade" }),
  exerciseSelectionId: uuid("exercise_selection_id")
    .notNull()
    .references(() => exerciseSelection.id, { onDelete: "restrict" }),
});

export type NewExercise = typeof exercise.$inferInsert;
export type DBExercise = typeof exercise.$inferSelect;
export type ExerciseWithSelection = {
  id: string;
  note: string | null;
  order: number;
  repLowerBound: number | null;
  repUpperBound: number | null;
  createdAt: Date;
  updatedAt: Date;
  workoutId: string;
  exerciseSelectionId: string;
  exerciseSelection: {
    id: string;
    name: string;
    category: string | null;
    primaryMuscleGroup: string;
    secondaryMuscleGroup: string | null;
  };
};

export const set = pgTable("set", {
  id: uuid("id").primaryKey().defaultRandom(),
  reps: integer("reps"),
  weight: integer("weight"),
  targetReps: integer("target_reps"),
  targetWeight: integer("target_weight"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercise.id, { onDelete: "cascade" }),
});

export type NewSet = typeof set.$inferInsert;
export type DBSet = typeof set.$inferSelect;

export const personalRecord = pgTable("personal_record", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutId: uuid("workout_id")
    .notNull()
    .references(() => workout.id, { onDelete: "cascade" }),
  exerciseSelectionId: uuid("exercise_selection_id")
    .notNull()
    .references(() => exerciseSelection.id, { onDelete: "cascade" }),
  setId: uuid("set_id").notNull().references(() => set.id, { onDelete: "cascade" }),
});

export type NewPersonalRecord = typeof personalRecord.$inferInsert;
export type PersonalRecord = typeof personalRecord.$inferSelect;

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
});

export const session = pgTable("session", {
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
});

export const account = pgTable("account", {
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
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
