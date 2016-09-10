'use strict';
const should = require('should'); // eslint-disable-line no-unused-vars,import/no-extraneous-dependencies
const chai = require('chai'); // eslint-disable-line no-unused-vars,import/no-extraneous-dependencies
const _ = require('lodash');

chai.config.includeStack = true;

describe('my-tests', () => {
  beforeEach((done) => {
    if (_.isFunction(done)) {
      done();
    }
  });
  afterEach((done) => {
    done();
  });

  describe('1st test', () => {
    it('should succeed', () => {
      const user = {
        name: 'joey',
        age: 42,
      };
      user.should.have.property('name', 'joey');
      user.should.have.property('age', 42);
    });
  });
});
