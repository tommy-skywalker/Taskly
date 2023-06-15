const API_URL = window.location.origin + '/api/tasks';

// DOM elements
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');

// Load tasks on page load
document.addEventListener('DOMContentLoaded', loadTasks);

// Handle form submission
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const title = taskInput.value.trim();
  if (!title) return;

  try {
    await createTask(title);
    taskInput.value = '';
    loadTasks();
  } catch (error) {
    console.error('Error creating task:', error);
    alert('Failed to create task. Please try again.');
  }
});

// API functions
async function fetchTasks() {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return response.json();
}

async function createTask(title) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
}

async function updateTask(id, updates) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
}

async function deleteTask(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete task');
}

// UI functions
async function loadTasks() {
  try {
    const tasks = await fetchTasks();
    renderTasks(tasks);
  } catch (error) {
    console.error('Error loading tasks:', error);
    taskList.innerHTML = '<div class="empty-state"><p>Error loading tasks. Please refresh the page.</p></div>';
  }
}

function renderTasks(tasks) {
  if (tasks.length === 0) {
    taskList.innerHTML = '<div class="empty-state"><p>No tasks yet. Add one above to get started!</p></div>';
    return;
  }

  taskList.innerHTML = tasks
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}">
      <input 
        type="checkbox" 
        ${task.completed ? 'checked' : ''} 
        onchange="toggleTask('${task.id}', this.checked)"
      >
      <span>${escapeHtml(task.title)}</span>
      <button onclick="removeTask('${task.id}')">Delete</button>
    </div>
  `).join('');
}

async function toggleTask(id, completed) {
  try {
    await updateTask(id, { completed });
    loadTasks();
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

