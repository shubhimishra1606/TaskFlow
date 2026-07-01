const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const taskValidationRules = [
  body('title').notEmpty().withMessage('Title is required').trim()
];

router.route('/')
  .get(getTasks)
  .post(taskValidationRules, createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;