/**
 * Global adapter config
 * 
 * The `adapters` configuration object lets you create different global "saved settings"
 * that you can mix and match in your models.  The `default` option indicates which 
 * "saved setting" should be used if a model doesn't have an adapter specified.
 *
 * Keep in mind that options you define directly in your model definitions
 * will override these settings.
 *
 * For more information on adapter configuration, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.adapters = {

  // If you leave the adapter config unspecified 
  // in a model definition, 'default' will be used.
  'default': 'disk',

  // Persistent adapter for DEVELOPMENT ONLY
  // (data is preserved when the server shuts down)
  disk: {
    module: 'sails-disk'
  },
  
  brm: {
    module: 'brm',
    type: 'json',             // expected response type (json | string | http)
    host: '10.0.0.100', // api host
    port: 80,                 // api port
    protocol: 'http',         // HTTP protocol (http | https)
    path: '/Apollo',       // base api path
    service: '/BRMRead.svc',       // api service
    query: {},                // query parameters to provide with all GET requests
    methods: {                // overrides default HTTP methods used for each CRUD action
      create: 'post',
      find: 'get',
      update: 'put',
      destroy: 'del'
    },
	logFile: 'logs/webservice.log',
    beforeFormatResult: function(result){return result},    // alter result prior to formatting
    afterFormatResult: function(result){return result},     // alter result after formatting
    beforeFormatResults: function(results){return results}, // alter results prior to formatting
    afterFormatResults: function(results){return results}  // alter results after formatting
    /*cache: {                  // optional cache engine
      engine : require('someCacheEngine')
    }*/
  },

  // MySQL is the world's most popular relational database.
  // Learn more: http://en.wikipedia.org/wiki/MySQL
  myLocalMySQLDatabase: {

    module: 'sails-mysql',
    host: 'YOUR_MYSQL_SERVER_HOSTNAME_OR_IP_ADDRESS',
    user: 'YOUR_MYSQL_USER',
    // Psst.. You can put your password in config/local.js instead
    // so you don't inadvertently push it up if you're using version control
    password: 'YOUR_MYSQL_PASSWORD', 
    database: 'YOUR_MYSQL_DB'
  }
};