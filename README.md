# lift

my personal hypertrophy training app

## tasks
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
- [ ] add PR table (see below)
- [ ] add check upon workout completion to see if PR was hit
- [ ] add workout breakdown to workout/complete page
- [ ] create workouts page
- [ ] create view completed workouts ui w/ github like activity graph, showing sentiment with emoji

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


- [ ] refactor workout hooks to minimize rerenders if necessary