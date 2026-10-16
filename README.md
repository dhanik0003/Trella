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
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER/trello
JWT_SECRET=replace-with-a-long-random-secret
```

Create a commit-safe template named `.env.example`:

```env
MONGODB_URI=
JWT_SECRET=
```

Ensure `.gitignore` contains:

```gitignore
node_modules/
.env
```

## Required code configuration

Load environment variables before using them. In `models.js`:

```js
import "dotenv/config";

mongoose.connect(process.env.MONGODB_URI);
```

Use `process.env.JWT_SECRET` for signing tokens in `index.js` and verifying tokens in `middleware.js`.

## Run locally

Start the server:

```bash
node index.js
```

Then open [http://localhost:3000](http://localhost:3000).

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
middleware.js   Authentication middleware
changesbygpt.md Detailed record of implemented changes
```
