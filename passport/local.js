'use strict';

const { Strategy: LocalStrategy } = require('passport-local');
const User = require('../models/user');
const localStrategy = new LocalStrategy((username, password, done) => {
  let user;
  User.findOne({ username })
    .then(result => {
      user = result;
      console.log('THIS IS THE FLAG FOR LOCALSTRATEGY USER VALUE', user);
      if (!user) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username',
          location: 'username'
        });
      }
      console.log('THIS IS THE PASSWORD FROM USER (LOCALSTRAT)', password);
      const isValid = user.validatePassword(password);
      return isValid;
    })
    .then((isValid) => {
      if (!isValid) {
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect password',
          location: 'password'
        });
      }
      return done(null, user);
    })
    .catch(err => {
      if (err.reason === 'LoginError') {
        return done(null, false);
      }
      return done(err);
    });
});

module.exports = localStrategy;