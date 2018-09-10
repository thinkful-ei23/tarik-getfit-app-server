'use strict';

const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: String,
  exercises: [{type: mongoose.Schema.Types.ObjectId, ref: 'Exercise'}],
  tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}]
});

routineSchema.set('timestamps', true);

routineSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = mongoose.model('Routine', routineSchema);