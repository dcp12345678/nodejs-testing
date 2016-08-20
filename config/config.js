'use strict';

module.exports = {

  WEB_SERVER_PORT: process.env.PORT,

  API_URI: process.env.ROOT_URL,

  /**
  * Configures Logging level for winston logger
  */
  LOGGING_LEVEL: 'debug',

  /**
  * Configures logging file for winston logging
  */
  LOG_FILE: './logs/app.log',

  /**
  * the from email address
  */
  FROM_EMAIL: 'joey@aol.com',
  FROM_NAME: 'Joey Smith',

  DATABASE_CONN_DETAILS: process.env.MONGO_URI,

  SOME_OTHER_PARM: 'unmatchedAppsEmailTemplate.ejs'
};
