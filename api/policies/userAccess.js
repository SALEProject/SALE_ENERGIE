/**
 * userAccess
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.allowed_states = [];
	Login.post(
		{
			"SessionId":sessionService.getSessionID(req),
			"currentState":'dashboard',
			"method":'checkaccess',
			"objects":[
				{
					"CheckState": '*'
				}
			]
		},
		function(error,response) {
			return parserService.parse(error,response,
				function(err){
					logService.debug(err);
					return next();
				},
				function(result){
					req.session.allowed_states = result;
					console.log(req.session.allowed_states);
					return next();
				}
			);
		}
	);
};
