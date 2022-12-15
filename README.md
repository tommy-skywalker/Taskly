# Taskly

A modern task management application built with TypeScript backend and vanilla JavaScript frontend.

## Features

- ✅ Create, read, update, and delete tasks
- ✅ Mark tasks as complete/incomplete
- ✅ Task priorities (Low, Medium, High)
- ✅ Task categories/tags
- ✅ Due dates with overdue indicators
- ✅ Task descriptions
- ✅ Filter tasks (All, Active, Completed)
- ✅ Search tasks by title or category
- ✅ Task statistics dashboard
- ✅ Dark mode support
- ✅ Export/Import tasks (JSON)
- ✅ Bulk operations (clear completed)
- ✅ Inline task editing
- ✅ Keyboard shortcuts (Ctrl+K for search, Ctrl+N for new task)
- ✅ Clean and modern UI
- ✅ Responsive design for mobile devices
- ✅ RESTful API backend
- ✅ TypeScript for type safety
- ✅ Tasks sorted by priority and creation date

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: HTML, CSS, JavaScript
- **API**: RESTful API

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
Taskly/
├── src/
│   └── server.ts          # Express server with TypeScript
├── public/
│   ├── index.html         # Frontend HTML
│   ├── style.css          # Styling
│   └── app.js             # Frontend JavaScript
├── dist/                  # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

- `GET /api/tasks` - Get all tasks (supports ?filter=active|completed and ?search=query)
- `GET /api/tasks/:id` - Get a single task
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/bulk-delete` - Delete multiple tasks
- `GET /api/tasks/stats` - Get task statistics
- `GET /api/tasks/export` - Export all tasks as JSON
- `POST /api/tasks/import` - Import tasks from JSON
- `GET /api/health` - Health check endpoint

## License

MIT

