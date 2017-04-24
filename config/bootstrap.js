/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {
	sails.util.fs = require('fs');

	// open logs
	logService.openLogs(function(){
		logService.debug('Starting application...');
	});
	sails.storage = {};
	sails.timers = {};
	sails.processes = {};
	sails.storage.sessions = [];
	sails.storage.users = {};
	sails.marketId = sails.config.marketId;

	if(sails.config.ssl.key) {
		var http = require('http');

		var server = http.createServer(function(req, res) {
			console.log('new http request: '+req.headers.host);
			res.writeHead(301,{Location: 'https://'+req.headers.host.replace('www.','')+req.url});
			res.end();
		});
		server.listen(sails.config.redirectPort);
		console.log('http server listening');
	}

	// start app session
	storageService.getAppSession(cb);
};