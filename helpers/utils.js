'use strict';

const errors = require('common-errors');
const httpStatus = require('http-status');


/**
* This method is responsible for writing err/response to response
*
* @param   {Object}    err       error from endpoint processing if any
* @param   {Object}    result    result from endpoint processing if any
* @param   {Object}    response  http response object
*/
function processResponse(err, result, response) {
  if (!err && result) {
    response.status(httpStatus.OK).json(result).end();
  } else {
    const statusCode = err && err.statusCode ? err.statusCode : 500;
    const message = err && err.message ? err.message : 'Internal error processing the request';
    response.status(statusCode).json({ code: statusCode, message: message }).end();
  }
}

/**
 * This method is responsible for converting mongodb error
 * to generic http error
 *
 * @param   {Object}    err  mongodb error object
 */
function handleMongodbError(err) {
  let httpError = null;
  if (!err) {
    return httpError;
  } else if (err.name === 'CastError') {
    httpError = new errors.HttpStatusError(httpStatus.BAD_REQUEST, `Invalid parameter ${err.path}`);
  } else if (err.name === 'ValidationError') {
    const mongoErrors = err.errors;
    let errorDesc = '';
    if (mongoErrors && Object.keys(mongoErrors).length > 0) {
      errorDesc = `Invalid ${mongoErrors[Object.keys(mongoErrors)[0]].path}`;
    }
    httpError = new errors.HttpStatusError(httpStatus.BAD_REQUEST,
      `${err.message}.${errorDesc}`);
  } else if (err.name === 'MongoError') {
    httpError = new errors.HttpStatusError(httpStatus.BAD_REQUEST, err.message);
  } else if (err.name === 'HttpStatusError') {
    httpError = err;
  } else {
    httpError = new errors.HttpStatusError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal error processing the request');
  }
  return httpError;
}

module.exports = {
  handleMongodbError: handleMongodbError,
  processResponse: processResponse
};
