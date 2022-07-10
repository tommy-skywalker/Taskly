const express = require('express');
const router = express.Router();
const taskService = require('../services/taskService');

router.get('/', (req, res) => {
  res.json(taskService.getAll());
});

router.post('/', (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const task = taskService.create(title, description);
  res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = taskService.update(id, req.body);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const deleted = taskService.delete(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.status(204).send();
});

module.exports = router;

