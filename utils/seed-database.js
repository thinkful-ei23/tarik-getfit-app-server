'use strict';

const mongoose = require('mongoose');

const { DATABASE_URL } = require('../config');
const Routine = require('../models/routine');
const Exercise = require('../models/exercise');
const Tag = require('../models/tag');
const User = require('../models/user');

const seedRoutines = require('../db/seed/routines');
const seedExercises = require('../db/seed/exercises');
const seedTags = require('../db/seed/tags');
const seedUsers = require('../db/seed/users');

mongoose.connect(DATABASE_URL)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
    return Promise.all([
      Routine.insertMany(seedRoutines),
      Routine.createIndexes(),
      Exercise.insertMany(seedExercises),
      Exercise.createIndexes(),
      Tag.insertMany(seedTags),
      Tag.createIndexes(),
      User.insertMany(seedUsers),
      User.createIndexes()
    ]);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });