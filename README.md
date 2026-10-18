# Trella

Trella is a lightweight Trello-style task board application. Users can create accounts, organise work into organisations and boards, invite members, and move issues through **Up next**, **In progress**, and **Done**.

## Features

- Account sign-up and sign-in
- Organisation creation and switching
- Board creation and organisation-member management
- Member invitations with duplicate-member protection
- Issue creation, movement, and deletion confirmation
- Responsive interface with loading, empty, success, and error states
- Client-side session handling and logout
- Password hashing with bcrypt
- Zod validation for sign-up, sign-in, organisation, member, board, and issue input

## Requirements

- Node.js 18 or later
- A MongoDB database (MongoDB Atlas works well)

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/YOUR_USERNAME/trello-clone.git
cd trello-clone
npm install
```

Install environment-variable support if it is not already installed:

```bash
npm install dotenv
```

## Environment variables

Create a `.env` file in the project root. Never commit this file.

```env
MONGODB_URL=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER/trello
JWT_SECRET=replace-with-a-long-random-secret
```

Create a commit-safe template named `.env.example`:

```env
MONGODB_URL=
JWT_SECRET=
```

Ensure `.gitignore` contains:

```gitignore
node_modules/
.env
```

## Required code configuration

The app loads environment variables using `dotenv`. The MongoDB connection in `models.js` uses:

```js
import "dotenv/config";

mongoose.connect(process.env.MONGODB_URL);
```

The authentication helper is in `authMiddleware.js` (not `middleware.js`, which is a reserved Vercel filename). Keep `JWT_SECRET` private and use the same value for signing and verifying JWTs.

## Input validation and password security

- Passwords are hashed with bcrypt before being stored.
- Sign-in uses bcrypt to compare the entered password with the stored hash.
- Zod validates usernames, passwords, organisation names/descriptions, member usernames, board titles, issue titles, and allowed issue states.
- Invalid validated input receives an HTTP `400` response.

## Run locally

Start the server:

```bash
node index.js
```

Then open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push the repository to GitHub without committing `.env`.
2. Import the repository at [Vercel](https://vercel.com/new) and select the **Express** preset.
3. Add `MONGODB_URL` and `JWT_SECRET` in Vercel's Environment Variables settings for Production and Preview.
4. Deploy and test sign-up, sign-in, organisation selection, boards, members, and issues.

Do not add a `PORT` environment variable in Vercel. Vercel manages it automatically.

## Git workflow

After making and testing a change:

```bash
git status
git add path/to/changed-file
git commit -m "Describe the change"
git push
```

Before every commit, confirm that `.env` is not staged:

```bash
git status
git check-ignore .env
```

If a database URI or secret has ever been committed or shared publicly, rotate it before pushing the repository.

## Project structure

```text
frontend/       Browser pages and UI logic
public/         Static assets and shared browser scripts
index.js        Express server and API routes
models.js       MongoDB/Mongoose models and connection
authMiddleware.js Authentication middleware
changesbygpt.md Detailed record of implemented changes
```
