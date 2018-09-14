'use strict';

const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {type: String, required: true},
  sets: {type: Number, required: true},
  reps: {type: Number, require: true},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

exerciseSchema.set('timestamps', true);

exerciseSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = mongoose.model('Exercise', exerciseSchema);