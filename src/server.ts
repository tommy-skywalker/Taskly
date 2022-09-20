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
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
}

let tasks: Task[] = [];

// API Routes

// Get all tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  const { filter, search } = req.query;
  let filteredTasks = [...tasks];
  
  // Apply filter
  if (filter === 'active') {
    filteredTasks = filteredTasks.filter(t => !t.completed);
  } else if (filter === 'completed') {
    filteredTasks = filteredTasks.filter(t => t.completed);
  }
  
  // Apply search
  if (search && typeof search === 'string') {
    const searchLower = search.toLowerCase();
    filteredTasks = filteredTasks.filter(t => 
      t.title.toLowerCase().includes(searchLower) ||
      (t.category && t.category.toLowerCase().includes(searchLower))
    );
  }
  
  res.json(filteredTasks);
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

  const { priority, dueDate, category } = req.body;
  
  const newTask: Task = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    priority: priority || 'medium',
    dueDate: dueDate || undefined,
    category: category || undefined
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

  const { title, completed, priority, dueDate, category } = req.body;
  
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title cannot be empty' });
    }
    tasks[taskIndex].title = title.trim();
  }
  
  if (completed !== undefined) {
    tasks[taskIndex].completed = Boolean(completed);
  }
  
  if (priority !== undefined) {
    tasks[taskIndex].priority = priority;
  }
  
  if (dueDate !== undefined) {
    tasks[taskIndex].dueDate = dueDate;
  }
  
  if (category !== undefined) {
    tasks[taskIndex].category = category;
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

// Bulk delete tasks
app.post('/api/tasks/bulk-delete', (req: Request, res: Response) => {
  const { ids } = req.body;
  
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'ids must be an array' });
  }
  
  tasks = tasks.filter(t => !ids.includes(t.id));
  res.json({ deleted: ids.length });
});

// Get task statistics
app.get('/api/tasks/stats', (req: Request, res: Response) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active = total - completed;
  const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
  
  res.json({
    total,
    completed,
    active,
    highPriority
  });
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

