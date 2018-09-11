'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Exercise = require('../models/exercise');

const Router = express.Router();

Router.post('/', (req, res, next) => {
  const newExercise = {
    name: req.body.name,
    sets: req.body.sets,
    reps: req.body.reps
  };

  if (!newExercise.name) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (typeof newExercise.sets !== 'number') {
    const err = new Error('`sets` is not a number');
    err.status = 400;
    return next(err);
  }

  if (typeof newExercise.reps !== 'number') {
    const err = new Error('`reps` is not a number');
    err.status = 400;
    return next(err);
  }

  return Exercise.create(newExercise)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = Router;