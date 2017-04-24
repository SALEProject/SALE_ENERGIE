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
	req.session.whitelist = [];
	Whitelist.post(
		{
			"SessionId":sessionService.getSessionID(req),
			"currentState":'dashboard',
			"method":'select',
			"procedure":'getWhitelist'
		},
		function(error,response) {
			return parserService.parse(error,response,
				function(err){
					logService.debug(err);
					return next();
				},
				function(result){
					for(var i=0;i<result.Rows.length;i++) {
						if(result.Rows[i].isAgreed) req.session.whitelist.push(result.Rows[i].ID);
					}
					return next();
				}
			);
		}
	);
};
