import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Request logging middleware (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, res: Response, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// In-memory storage (in production, use a database)
interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  category?: string;
  description?: string;
  updatedAt?: string;
}

let tasks: Task[] = [];

// API Routes

// Get all tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  const { filter, search, sort } = req.query;
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
      (t.category && t.category.toLowerCase().includes(searchLower)) ||
      (t.description && t.description.toLowerCase().includes(searchLower))
    );
  }
  
  // Apply sorting
  if (sort === 'priority') {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    filteredTasks.sort((a, b) => {
      const aPriority = priorityOrder[a.priority || 'medium'] || 2;
      const bPriority = priorityOrder[b.priority || 'medium'] || 2;
      return bPriority - aPriority;
    });
  } else if (sort === 'dueDate') {
    filteredTasks.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  } else if (sort === 'created') {
    filteredTasks.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
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

  const { priority, dueDate, category, description } = req.body;
  
  const newTask: Task = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    priority: priority || 'medium',
    dueDate: dueDate || undefined,
    category: category || undefined,
    description: description || undefined
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

  const { title, completed, priority, dueDate, category, description } = req.body;
  
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title cannot be empty' });
    }
    tasks[taskIndex].title = title.trim();
    tasks[taskIndex].updatedAt = new Date().toISOString();
  }
  
  if (completed !== undefined) {
    tasks[taskIndex].completed = Boolean(completed);
    tasks[taskIndex].updatedAt = new Date().toISOString();
  }
  
  if (priority !== undefined) {
    tasks[taskIndex].priority = priority;
    tasks[taskIndex].updatedAt = new Date().toISOString();
  }
  
  if (dueDate !== undefined) {
    tasks[taskIndex].dueDate = dueDate;
    tasks[taskIndex].updatedAt = new Date().toISOString();
  }
  
  if (category !== undefined) {
    tasks[taskIndex].category = category;
    tasks[taskIndex].updatedAt = new Date().toISOString();
  }
  
  if (description !== undefined) {
    tasks[taskIndex].description = description;
    tasks[taskIndex].updatedAt = new Date().toISOString();
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
  const overdue = tasks.filter(t => 
    t.dueDate && 
    new Date(t.dueDate) < new Date() && 
    !t.completed
  ).length;
  
  res.json({
    total,
    completed,
    active,
    highPriority,
    overdue
  });
});

// Export tasks
app.get('/api/tasks/export', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=tasks.json');
  res.json(tasks);
});

// Import tasks
app.post('/api/tasks/import', (req: Request, res: Response) => {
  const { tasks: importedTasks } = req.body;
  
  if (!Array.isArray(importedTasks)) {
    return res.status(400).json({ error: 'Invalid tasks format' });
  }
  
  // Validate and merge tasks
  importedTasks.forEach((task: any) => {
    if (task.id && task.title) {
      const existingIndex = tasks.findIndex(t => t.id === task.id);
      if (existingIndex >= 0) {
        tasks[existingIndex] = { ...tasks[existingIndex], ...task };
      } else {
        tasks.push(task);
      }
    }
  });
  
  res.json({ imported: importedTasks.length, total: tasks.length });
});

// Serve frontend
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    tasksCount: tasks.length 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Taskly server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});

