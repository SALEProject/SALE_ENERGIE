exports.openLogs = function(cb) {
	sails.logger = {};
	sails.util.fs = require('fs');
	sails.logsCount = 0;
	sails.util.fs.open('logs/debug.log', 'a', function(err, fd) {
		if(err) console.log('Cannot open debug log!');
		else {
			sails.logger.debug = 'logs/debug.log';
		}
		sails.logsCount++;
		callback();
	});
	sails.util.fs.open('logs/error.log', 'a', function(err, fd) {
		if(err) console.log('Cannot open error log!');
		else {
			sails.logger.error = 'logs/error.log';
		}
		sails.logsCount++;
		callback();
	});
	sails.util.fs.open('logs/access.log', 'a', function(err, fd) {
		if(err) console.log('Cannot open access log!');
		else {
			sails.logger.access = 'logs/access.log';
		}
		sails.logsCount++;
		callback();
	});
	sails.util.fs.open('logs/webservice.log', 'a', function(err, fd) {
		if(err) console.log('Cannot open webservice log!');
		else {
			sails.logger.webservice = 'logs/webservice.log';
		}
		sails.logsCount++;
	});
	
	function callback() {
		if(sails.logsCount==3) {
			return cb();
		}
	}
};

exports.debug = function(message) {
	var t = new Date();
	var log_msg = '[' + t.toLocaleString() + ']: ' + message + "\n";
	sails.util.fs.appendFile(sails.logger.debug,log_msg,function(err){
		if(err) sails.log.error('Cannot write to debug log file! ('+err+')');
	});
};

exports.access = function(message) {
	var t = new Date();
	var log_msg = '[' + t.toLocaleString() + ']: ' + message + "\n";
	sails.util.fs.appendFile(sails.logger.access,log_msg,function(err){
		if(err) sails.log.error('Cannot write to debug log file! ('+err+')');
	});
};

exports.webservice = function(message) {
	var t = new Date();
	var log_msg = '[' + t.toLocaleString() + ']: ' + message + "\n";
	sails.util.fs.appendFile(sails.logger.webservice,log_msg,function(err){
		if(err) sails.log.error('Cannot write to webservice log file! ('+err+')');
	});
};
