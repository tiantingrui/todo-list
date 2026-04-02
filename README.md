# Todo List

A full-stack todo list app with user auth, categories, tags, priorities, due dates, search/filter, and drag-and-drop reorder.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + @dnd-kit
- **Backend**: Express + TypeScript + Prisma + SQLite
- **Auth**: JWT + bcrypt

## Quick Start

```bash
# 1. Install dependencies
cd server && npm install
cd ../client && npm install
cd ..

# 2. Setup database
cd server
cp .env.example .env
npx prisma migrate dev --name init
cd ..

# 3. Run (starts both frontend & backend)
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Project Structure

```
todo-list/
├── client/          # React frontend
│   ├── src/
│   │   ├── api/         # API client (axios)
│   │   ├── components/  # TodoList, TodoItem, FilterBar...
│   │   ├── contexts/    # AuthContext
│   │   ├── hooks/       # useTodos
│   │   ├── pages/       # Home, Login, Register
│   │   └── types/       # TypeScript types
│   └── vite.config.ts   # Vite + proxy config
├── server/          # Express backend
│   ├── prisma/          # Schema + migrations
│   └── src/
│       ├── middleware/   # JWT auth
│       └── routes/      # auth, todos, categories, tags
└── docs/specs/      # Technical spec
```

## Features

- User registration & login
- Todo CRUD with inline editing
- Categories with color coding
- Tags
- Priority levels (High / Medium / Low)
- Due dates with overdue highlighting
- Full-text search + multi-filter
- Drag-and-drop reorder
- Responsive layout
