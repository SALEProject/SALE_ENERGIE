/**
 * isAdministrator
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.userRoles = [];
	Login.post(
		{
			"SessionId":sessionService.getSessionID(req),
			"currentState":'login',
			"method":'getUserRoles'
		},
		function(error,response) {
			return parserService.parse(error,response,
				function(err){
					logService.debug(err);
					return next();
				},
				function(result){
					req.session.userRoles = result.Rows;
					return next();
				}
			);
		}
	);
};
