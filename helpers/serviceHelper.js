'use strict';

const logger = require('./logger');
const Person = require('../models/person').Person;

function createModel(model, modelName, modelData, callback) {
  debugger;
  logger.debug('Creating new Model : %s', modelName);
  const modelObj = model(modelData);
  logger.debug('Done creating new Model');
  logger.debug('Preparing to save model...');
  modelObj.save((err, newModelObj) => {
    if (err) {
      logger.error('Error adding new %s ! Error : %s', modelName, JSON.stringify(err));
      callback(utils.handleMongodbError(err), null);
    } else {
      logger.info('New Model of type : %s created with id : %s', modelName, JSON.stringify(newModelObj._id));
      callback(null, {
        _id: newModelObj._id,
        message: `New ${modelName} created! with _id : ${newModelObj._id}`
      });
    }
  });
}

function deleteAllPeople(callback) {
  logger.debug('deleting all people');
  Person.remove({}, (err) => {
    if (!err) {
      logger.debug('all people deleted!');
      callback();
    } else {
      logger.debug('err deleting people ' + JSON.stringify(err));
    }
  })
}

function getAllPeople(callback) {
  Person.find({}, (err, result) => {
    if (!err) {
      logger.debug('all people retrieved successfully');
      callback(result);
    } else {
      logger.debug('err getting all people ' + JSON.stringify(err));
    }
  });
}

module.exports = {
  createModel: createModel,
  deleteAllPeople: deleteAllPeople,
  getAllPeople: getAllPeople
};

