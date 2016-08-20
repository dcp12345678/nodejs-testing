'use strict';

const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  address: String,
  age: Number
});

const Person = mongoose.model('Person', personSchema);

module.exports = {
  Person: Person
};
