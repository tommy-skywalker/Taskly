const Task = require('../models/Task');

class TaskService {
  constructor() {
    this.tasks = [];
    this.nextId = 1;
  }

  getAll() {
    return this.tasks.map(task => task.toJSON());
  }

  getById(id) {
    return this.tasks.find(task => task.id === id);
  }

  create(title, description = '') {
    const task = new Task(this.nextId++, title, description);
    this.tasks.push(task);
    return task.toJSON();
  }

  update(id, data) {
    const task = this.getById(id);
    if (!task) {
      return null;
    }
    task.update(data);
    return task.toJSON();
  }

  delete(id) {
    const index = this.tasks.findIndex(task => task.id === id);
    if (index === -1) {
      return false;
    }
    this.tasks.splice(index, 1);
    return true;
  }

  toggle(id) {
    const task = this.getById(id);
    if (!task) {
      return null;
    }
    task.toggle();
    return task.toJSON();
  }
}

module.exports = new TaskService();

