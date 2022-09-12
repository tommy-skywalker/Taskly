function validateTask(req, res, next) {
  const { title, description } = req.body;
  
  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
  }
  
  if (title.length > 200) {
    return res.status(400).json({ error: 'Title must be less than 200 characters' });
  }
  
  if (description && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string' });
  }
  
  if (description && description.length > 1000) {
    return res.status(400).json({ error: 'Description must be less than 1000 characters' });
  }
  
  next();
}

function validateTaskId(req, res, next) {
  const id = parseInt(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid task ID' });
  }
  req.params.id = id;
  next();
}

module.exports = {
  validateTask,
  validateTaskId
};

