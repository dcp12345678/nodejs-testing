/* eslint no-console: 0 */
'use strict';

/////
require('dotenv').config();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const configObj = require('./config/config');
const logger = require('./helpers/logger');
const cors = require('cors');
const express = require('express');
const path = require('path');
const http = require('http');
const requestify = require('requestify');
const async = require('async');
const utils = require('./helpers/utils');
const serviceHelper = require('./helpers/serviceHelper');
const Person = require('./models/person').Person;

const app = express();
app.use(bodyParser.json());
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'public')));

app.set('port', configObj.PORT || 3000);

const baseUrl = 'http://localhost:' + app.get('port');

const dummyObj = {
  prop1: 'this is prop1',
  prop2: 42,
};

mongoose.connect(configObj.DATABASE_CONN_DETAILS);
// mongoose.set('debug', true);

http.createServer(app).listen(app.get('port'), () => {
  logger.info('express server started on port : %d', app.get('port'));

  async.waterfall([
    (callback) => {
      logger.debug('calling serviceHelper.deleteAllPeople');
      serviceHelper.deleteAllPeople(callback);
    },
    (callback) => {
      logger.debug('calling requestify.post');
      requestify.post(baseUrl + '/savePerson', {
        firstName: 'jimmy',
        lastName: 'smith',
        address: '123 Any Road, Omaha NE 12345',
        age: 34,
      }).then((res) => {
        console.log('inside the "then" handler');
        console.log('res.getBody() = ' + JSON.stringify(res.getBody()));
        callback(null);
      }, (err) => {
        console.log('An error occurred, ' + err.body);
        callback(err);
      });
    },
  ], (err, result) => {
    if (err) {
      console.log('error encountered: ' + JSON.stringify(err));
    } else {
      console.log('result = ' + result);
    }
  });
});

app.use((req, res, next) => {
  req.dummyObj = dummyObj; // add dummyObj to request
  next();
});

app.get('/', (req, res) => {
  console.log('req.dummyObj = ' + JSON.stringify(req.dummyObj));
  res.contentType('text/html');
  res.sendFile(path.join(__dirname, '/html', 'main.html'));
});

app.get('/getAllPeople', (req, res) => {
  serviceHelper.getAllPeople((people) => {
    res.send(people);
  });
});

app.get('/addPerson', (req, res) => {
  res.contentType('text/html');
  res.sendFile(path.join(__dirname, '/html', 'addPerson.html'));
});

app.post('/savePerson', (req, res) => {
  console.log('req.body = %s\n', JSON.stringify(req.body));
  async.waterfall([
    (callback) => {
      serviceHelper.createModel(Person, 'Person', req.body, callback);
    },
  ], (err, result) => {
    utils.processResponse(err, result, res);
  });
});

module.exports = app;
