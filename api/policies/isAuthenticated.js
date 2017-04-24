/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	if (req.isSocket) {
		if(req.socket.manager.handshaken[req.socket.id].session.authenticated && sails.storage.users.hasOwnProperty(req.socket.manager.handshaken[req.socket.id].sessionID)) {
			return next();
		}
		else {
			return res.json({Success:false, ResultType:'GeneralError', Result: 'S-a pierdut conexiunea cu serverul. Este necesara relogarea.'});
		}
	}
	else if(req.session.authenticated) {
		return next();
	}
	return res.redirect('/login');
};
