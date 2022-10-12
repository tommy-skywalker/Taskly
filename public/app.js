const API_URL = window.location.origin + '/api/tasks';

// State
let currentFilter = 'all';
let currentSearch = '';

// DOM elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const statsBar = document.getElementById('statsBar');
const searchInput = document.getElementById('searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('themeToggle');
const prioritySelect = document.getElementById('prioritySelect');
const dueDateInput = document.getElementById('dueDateInput');
const categoryInput = document.getElementById('categoryInput');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  loadStats();
  initTheme();
  setupEventListeners();
  setupKeyboardShortcuts();
});

// Event listeners
function setupEventListeners() {
  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      loadTasks();
    });
  });

  // Search
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    loadTasks();
  });

  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);

  // Form submission
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleTaskCreation();
  });
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Focus search with Ctrl/Cmd + K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
    // Focus task input with Ctrl/Cmd + N
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      taskInput.focus();
    }
  });
}

// Theme management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  themeToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// API functions
async function fetchTasks() {
  const params = new URLSearchParams();
  if (currentFilter !== 'all') params.append('filter', currentFilter);
  if (currentSearch) params.append('search', currentSearch);
  
  const url = `${API_URL}${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
}

async function fetchStats() {
  const response = await fetch(`${API_URL}/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

async function createTask(taskData) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
}

async function updateTask(id, updates) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
}

async function deleteTask(id) {
  const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete task');
}

// Task creation
async function handleTaskCreation() {
  const title = taskInput.value.trim();
  if (!title) return;

  const taskData = {
    title,
    priority: prioritySelect.value,
    dueDate: dueDateInput.value || undefined,
    category: categoryInput.value.trim() || undefined,
  };

  try {
    await createTask(taskData);
    taskInput.value = '';
    categoryInput.value = '';
    dueDateInput.value = '';
    prioritySelect.value = 'medium';
    loadTasks();
    loadStats();
  } catch (error) {
    console.error('Error creating task:', error);
    alert('Failed to create task. Please try again.');
  }
}

// Load and render
async function loadTasks() {
  try {
    const tasks = await fetchTasks();
    renderTasks(tasks);
  } catch (error) {
    console.error('Error loading tasks:', error);
    taskList.innerHTML = '<div class="empty-state"><p>Error loading tasks. Please refresh the page.</p></div>';
  }
}

async function loadStats() {
  try {
    const stats = await fetchStats();
    renderStats(stats);
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

function renderStats(stats) {
  statsBar.innerHTML = `
    <div class="stat-item">
      <span class="stat-value">${stats.total}</span>
      <span class="stat-label">Total</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${stats.active}</span>
      <span class="stat-label">Active</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${stats.completed}</span>
      <span class="stat-label">Completed</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">${stats.highPriority}</span>
      <span class="stat-label">High Priority</span>
    </div>
  `;
}

function renderTasks(tasks) {
  if (tasks.length === 0) {
    const message = currentSearch 
      ? 'No tasks found matching your search.'
      : currentFilter === 'active'
      ? 'No active tasks. Great job!'
      : currentFilter === 'completed'
      ? 'No completed tasks yet.'
      : 'No tasks yet. Add one above to get started!';
    taskList.innerHTML = `<div class="empty-state"><p>${message}</p></div>`;
    return;
  }

  taskList.innerHTML = tasks
    .sort((a, b) => {
      // Sort by priority first (high > medium > low), then by date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .map(task => renderTaskItem(task))
    .join('');
}

function renderTaskItem(task) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const priorityClass = `priority-${task.priority || 'medium'}`;
  
  return `
    <div class="task-item ${task.completed ? 'completed' : ''}">
      <input 
        type="checkbox" 
        ${task.completed ? 'checked' : ''} 
        onchange="toggleTask('${task.id}', this.checked)"
      >
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="priority-badge ${priorityClass}">${(task.priority || 'medium').toUpperCase()}</span>
          <span>${escapeHtml(task.title)}</span>
        </div>
        <div class="task-meta">
          ${task.category ? `<span class="category-tag">${escapeHtml(task.category)}</span>` : ''}
          ${task.dueDate ? `<span class="due-date ${isOverdue ? 'overdue' : ''}">📅 ${formatDate(task.dueDate)}${isOverdue ? ' (Overdue)' : ''}</span>` : ''}
        </div>
      </div>
      <button onclick="removeTask('${task.id}')">Delete</button>
    </div>
  `;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Task actions
async function toggleTask(id, completed) {
  try {
    await updateTask(id, { completed });
    loadTasks();
    loadStats();
  } catch (error) {
    console.error('Error updating task:', error);
    alert('Failed to update task. Please try again.');
  }
}

async function removeTask(id) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  
  try {
    await deleteTask(id);
    loadTasks();
    loadStats();
  } catch (error) {
    console.error('Error deleting task:', error);
    alert('Failed to delete task. Please try again.');
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
