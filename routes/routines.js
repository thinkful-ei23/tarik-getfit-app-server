'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Routine = require('../models/routine');
const Exercise = require('../models/exercise');
const Tag = require('../models/tag');

const Router = express.Router();

//==========GET all routines=========
Router.get('/', (req, res, next) => {
  let filter = {};
  const { searchTerm } = req.query;
  const { tagId } = req.query;
  
  if (searchTerm) {
    filter.title = {$regex: searchTerm, $options: 'i'};
  }
  if (tagId) {
    filter.tags = tagId;
  }

  return Routine.find(filter)
    .sort({ updatedAt: 'desc'})
    .populate('exercises', 'name sets reps')
    .populate('tags', 'name')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

//============GET by ID=================
Router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  return Routine.findOne({_id: id})
    .then(routine => {
      if (routine) {
        res.json(routine);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

//=====POST/Create a new routine=====
Router.post('/', (req, res, next) => {
  const newRoutine = {
    title: req.body.title,
    description: req.body.description,
    exercises: req.body.exercises,
    tags: req.body.tags
  };

  if (!newRoutine.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (!newRoutine.exercises) {
    newRoutine.exercises = [];
  }

  if (!newRoutine.tags) {
    newRoutine.tags = [];
  }

  if (newRoutine.exercises) {
    if (!Array.isArray(newRoutine.exercises)) {
      const err = new Error('`exercises` is not an array');
      err.status = 400;
      return next(err);
    }

    newRoutine.exercises.forEach(exercise => {
      if (typeof exercise !== 'object') {
        const err = new Error('The `exercise` array must consist of objects');
        err.status = 400;
        return next(err);
      }

      if (!exercise.name) {
        const err = new Error('Missing `name` for object in `exercise` array');
        err.status = 400;
        return next(err);
      }

      if (typeof exercise.sets !== 'number') {
        const err = new Error('`sets` is not a number for object in `exercise` array');
        err.status = 400;
        return next(err);
      }

      if (typeof exercise.reps !== 'number') {
        const err = new Error('`reps` is not a number for object in `exercise` array');
        err.status = 400;
        return next(err);
      }
    });
  }

  // if (newRoutine.tags) {
  //   if (!Array.isArray(newRoutine.tags)) {
  //     const err = new Error('`tags` is not an array');
  //     err.status = 400;
  //     return next(err);
  //   }

  //   newRoutine.tags.forEach(tag => {
  //     if (!mongoose.Types.ObjectId.isValid(tag)) {
  //       const err = new Error('The `tags` array contains an invalid `id`');
  //       err.status = 400;
  //       return next(err);
  //     }
  //   });
  // }

  return Exercise.create(newRoutine.exercises)
    .then(result => {
      const res = result.map(exercise => exercise.id);
      newRoutine.exercises = res;
      return Routine.create(newRoutine);
    })
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});

Router.put('/:id', (req, res, next) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({message});
  }

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error('The `endpoint id` is not valid');
    err.status = 400;
    return next(err);
  }

  const { id } = req.params;

  const updateObj = {};
  const updatableFields = ['title', 'description', 'exercises', 'tags'];
  updatableFields.forEach(field => {
    if (req.body[field]) {
      updateObj[field] = req.body[field];
    }
  });

  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (!updateObj.exercises) {
    updateObj.exercises = [];
  }

  if (!updateObj.tags) {
    updateObj.tags = [];
  }

  if (updateObj.exercises) {
    if (!Array.isArray(updateObj.exercises)) {
      const err = new Error('`exercises` is not an array');
      err.status = 400;
      return next(err);
    }

    updateObj.exercises.forEach(exercise => {
      if (!mongoose.Types.ObjectId.isValid(exercise)) {
        const err = new Error('The `exercise` array contains an invalid `id`');
        err.status = 400;
        return next(err);
      }
    });
  }

  if (updateObj.tags) {
    if (!Array.isArray(updateObj.tags)) {
      const err = new Error('`tags` is not an array');
      err.status = 400;
      return next(err);
    }

    updateObj.tags.forEach(tag => {
      if (!mongoose.Types.ObjectId.isValid(tag)) {
        const err = new Error('The `tags` array contains an invalid `id`');
        err.status = 400;
        return next(err);
      }
    });
  }

  return Routine.findByIdAndUpdate(id, updateObj, {new: true})
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

Router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  return Routine.findByIdAndDelete(id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = Router;