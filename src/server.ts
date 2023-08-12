import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory storage (in production, use a database)
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

let tasks: Task[] = [];

// API Routes

// Get all tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  res.json(tasks);
});

// Get a single task
app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Create a new task
app.post('/api/tasks', (req: Request, res: Response) => {
  const { title } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const newTask: Task = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update a task
app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, completed } = req.body;
  
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title cannot be empty' });
    }
    tasks[taskIndex].title = title.trim();
  }
  
  if (completed !== undefined) {
    tasks[taskIndex].completed = Boolean(completed);
  }

  res.json(tasks[taskIndex]);
});

// Delete a task
app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

// Serve frontend
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Taskly server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

