const express = require('express');
const path = require('path');
const config = require('./config');
const taskRoutes = require('./routes/tasks');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/tasks', taskRoutes);

app.listen(config.port, () => {
  console.log(`Taskly server running on port ${config.port}`);
});

