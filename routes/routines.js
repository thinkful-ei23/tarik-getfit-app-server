'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Routine = require('../models/routine');
const Exercise = require('../models/exercise');
const Tag = require('../models/tag');

const Router = express.Router();

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

module.exports = Router;