# lift

A hypertrophy training app for tracking workouts, sets, and progression over time.

## Features

- Create and track workouts with exercises and sets
- Track personal records (PRs) automatically on workout completion
- View strength progression charts by muscle group or specific exercise
- AI-powered workout generation based on training history and preferences
- Activity calendar with workout sentiment tracking
- Weekly volume analysis per muscle group

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Drizzle ORM with PostgreSQL
- TanStack Query
- Better Auth (Google OAuth)
- Vercel AI SDK

## Local Development

### Prerequisites

- Node.js 20+
- pnpm 10+
- PostgreSQL database

### Environment Variables

Create a `.env` file in the project root. See `src/env.js` for the schema. Required variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth sessions |
| `BETTER_AUTH_URL` | Base URL for auth (e.g., `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Public app URL (e.g., `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID from [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `MY_USER_ID` | Your user ID (restricts AI workout generation to this user) |
| `AI_GATEWAY_API_KEY` | API key for AI Gateway (used for AI workout generation) |

### Setup

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

### Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm check` - Run linting and type checking

## Tasks
- [x] initial project setup
- [x] setup db
- [x] setup shadcn/themes
- [x] add auth + sign in page
- [x] basic navbar
- [x] mock workout ui
- [x] mock create workout ui
- [x] create workout schema
- [x] add server actions to update exercise note and handle update set functions
- [x] add onBlur function to rep/weight input fields to save
- [x] hook up workout uis to store data
- [x] add workout completed/completedAt cols to workout table
- [x] add target weight/reps to sets table
- [x] add rep upper/lower bounds to exercise table
- [x] add workout sentiment to workout table (good, medium, bad) for how user felt about that workout
- [x] add complete workout functionality with optional date picker
- [x] add rating workout sentiment in completed workout page
- [x] add tanstack query for client/server state management
- [x] refactor workout-tracker queries and mutations into custom hook
- [x] break workout-tracker into multiple components (maybe?)
- [x] fix complete workout functionality after react query refactor
- [x] add ExerciseSelection table, add reference in exercises table
- [x] make new set button be disabled while adding exercise
- [x] add PR table (see below)
- [x] add check upon workout completion to see if PR was hit
- [x] add workout breakdown to workout complete page
- [x] create workouts page (see below)
- [x] add better templates for push pull legs with my current workouts
- [x] setup AI SDK gateway
- [x] add workout object generation
- [x] add workout object validation (checking that exercises do exist)
- [x] add past 4 weeks of workout volume and performance to prompt (see below)
- [x] complete AI workout generation
- [ ] figure out what to test and how to test
- [ ] add GitHub actions CI
- [x] deploy on railway

### adding last month of workout data to AI workout generation prompt
Options for user to select:
- Are you a beginner? Y/N
- What type of split are you on? (Or prefer) Upper/Lower, Push Pull Legs, Full body
- Do you prefer high or low volume?

When not to take previous workouts into account:
- if user is a beginner, don't take previous workouts into account
- if user averages less than 3 workouts per week, don't take previous workouts into account
- if user has not repeated any exercises over last month, don't take previous workouts into account
- above cases: generate workout so that if user were to do it 2x a week, their volume would fall under the 10-20 sets per muscle group per week range.

Taking previous workout data into account:
- otherwise, calc strength up/down for muscle groups over last month (if possible)
- calc set volume per muscle group per week
- muscle group volume > 20 sets, strength decrease -> lower volume, but stay above 10 sets
- muscle group volume < 10 sets, strength decrease -> higher volume, but stay below 20 sets
- strength increase -> same volume

### adding PR table and checking upon workout completion
- userId, workoutId, exerciseSelectionId, weight, reps
to update PRs upon workout completion:
- gather PRs for each exercise of the workout (or all so we only do one query?)
- go through each PR
- get exercise for that PR, get sets for that exercise
- compare each set with PR, if set is greater in weight or reps, update PR

### workout breakdown component
want to show:
- total sets
- sets per muscle group
- heaviest set
- were any PRs hit? select PRs by workoutId then list them

### adding a streak stat
- week streak? 3 or more workouts in a weak for consecutive weeks builds a streak
- likely will be derived from all workouts for user

### workouts page plan
- completed workouts ui w/ github like activity graph, showing sentiment with emoji
- show your average sets per muscle group per week (don't include current week?)
- show current weekly streak (3+ workouts per week)

### Important stats I want to know
- progression on each exercise over time
- current PRs
- average sets per muscle group per week
- frequency of rest days (average rest days per week?)

- [ ] refactor workout hooks to minimize rerenders if necessary