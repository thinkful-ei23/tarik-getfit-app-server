'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Routine = require('../models/routine');
const Exercise = require('../models/exercise');
const Tag = require('../models/tag');

const Router = express.Router();

Router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

//==========GET all routines=========
Router.get('/', (req, res, next) => {
  let filter = {};
  const { searchTerm } = req.query;
  const { tagId } = req.query;
  const userId = req.user.id;

  filter = { userId };
  
  if (searchTerm) {
    filter.title = {$regex: searchTerm, $options: 'i'};
  }
  if (tagId) {
    filter.tags = tagId;
  }

  return Routine.find(filter)
    .sort({ updatedAt: 'desc'})
    .populate('exercises', 'name sets reps userId')
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
  const userId = req.user.id;

  return Routine.findOne({_id: id, userId})
    .populate('exercises', 'name sets reps userId')
    .populate('tags', 'name')
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
  const userId = req.user.id;

  const newRoutine = {
    title: req.body.title,
    description: req.body.description,
    exercises: req.body.exercises,
    tags: req.body.tags,
    userId
  };
  console.log(newRoutine.exercises);

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
  console.log(newRoutine.exercises);
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

  if (newRoutine.exercises.length > 0) {
    console.log(newRoutine.exercises);
    const mappedEx = newRoutine.exercises.map(exercise => {
      return Object.assign({}, exercise, {
        userId
      });
    });
  
    newRoutine.exercises = mappedEx;

    return Exercise.create(newRoutine.exercises)
      .then(result => {
        const res = result.map(exercise => exercise.id);
        newRoutine.exercises = res;
        return Routine.create(newRoutine);
      })
      .then(result => {
        const {id} = result;
        return Routine.findById(id).populate('exercises', 'name sets reps userId').populate('tags', 'name');
      })
      .then(result => {
        res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
      })
      .catch(err => {
        next(err);
      });
  } else {
    return Routine.create(newRoutine)
      .then(result => {
        const {id} = result;
        return Routine.findById(id).populate('exercises', 'name sets reps userId').populate('tags', 'name');
      })
      .then(result => {
        res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
      })
      .catch(err => {
        next(err);
      });
  }
});

Router.put('/:id', (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    const err = new Error('The `endpoint id` is not valid');
    err.status = 400;
    return next(err);
  }

  const { id } = req.params;
  const userId = req.user.id;
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

  if (updateObj.exercises.length > 0) {
    const mappedEx = updateObj.exercises.map(exercise => {
      return Object.assign({}, exercise, {
        userId
      });
    });
  
    updateObj.exercises = mappedEx;

    Routine.findOne({userId, _id: id})
      .then(result => {
        const deleteIds = result.exercises;
        return Exercise.deleteMany({userId, _id: {$in: deleteIds}});
      })
      .then(() => {
        return Exercise.create(updateObj.exercises);
      })
      .then(result => {
        const res = result.map(exercise => exercise.id);
        updateObj.exercises = res;
        return Routine.findOneAndUpdate({_id: id, userId}, {$set: updateObj}, {new: true});
      })
      .then(result => {
        if (result) {
          const {id} = result;
          return Routine.findById(id).populate('exercises', 'name sets reps userId').populate('tags', 'name');
        } else {
          next();
        }
      })
      .then(result => {
        res.json(result);
      })
      .catch(err => {
        next(err);
      });
  } else {
    Routine.findOne({userId, _id: id})
      .then(result => {
        const deleteIds = result.exercises;
        return Exercise.deleteMany({userId, _id: {$in: deleteIds}});
      })
      .then(() => {
        return Routine.findOneAndUpdate({_id: id, userId}, {$set: updateObj}, {new: true});
      })
      .then(result => {
        if (result) {
          const {id} = result;
          return Routine.findById(id).populate('exercises', 'name sets reps userId').populate('tags', 'name');
        } else {
          next();
        }
      })
      .then(result => {
        res.json(result);
      })
      .catch(err => {
        next(err);
      });
  }

  // const mappedEx = updateObj.exercises.map(exercise => {
  //   return Object.assign({}, exercise, {
  //     userId
  //   });
  // });

  // updateObj.exercises = mappedEx;

  // let deleteIds;

  // Routine.findOne({userId, _id: id})
  //   .then(result => {
  //     deleteIds = result.exercises;
  //     return Exercise.deleteMany({userId, _id: {$in: deleteIds}});
  //   })
  //   .then(() => {
  //     return Exercise.create(updateObj.exercises);
  //   })
  //   .then(result => {
  //     const res = result.map(exercise => exercise.id);
  //     updateObj.exercises = res;
  //     return Routine.findOneAndUpdate({_id: id, userId}, {$set: updateObj}, {new: true});
  //   })
  //   .then(result => {
  //     if (result) {
  //       const {id} = result;
  //       return Routine.findById(id).populate('exercises', 'name sets reps userId').populate('tags', 'name');
  //     } else {
  //       next();
  //     }
  //   })
  //   .then(result => {
  //     res.json(result);
  //   })
  //   .catch(err => {
  //     next(err);
  //   });

  // if (updateObj.tags) {
  //   if (!Array.isArray(updateObj.tags)) {
  //     const err = new Error('`tags` is not an array');
  //     err.status = 400;
  //     return next(err);
  //   }

  //   updateObj.tags.forEach(tag => {
  //     if (!mongoose.Types.ObjectId.isValid(tag)) {
  //       const err = new Error('The `tags` array contains an invalid `id`');
  //       err.status = 400;
  //       return next(err);
  //     }
  //   });
  // }
});

Router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  let deleteIds;

  Routine.findOne({userId, _id: id})
    .then(result => {
      deleteIds = result.exercises;
      return Exercise.deleteMany({userId, _id: {$in: deleteIds}});
    })
    .then(() => {
      return Routine.findByIdAndDelete(id);
    })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = Router;