/**
 * userOperations
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.allowed_operations = {};
	var total = req.session.allowed_states.length;

	//for(var i=0;i<req.session.allowed_states.length;i++) {
		Login.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard_orders',
				"method":'checkstateoperation',
				"objects":[
					{
						"CheckStateOperation": ''
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						logService.debug(err);
						req.session.allowed_operations['dashboard_orders'] = [];
						return next();
					},
					function(result){
						req.session.allowed_operations['dashboard_orders'] = result;
						return next();
					}
				);
			}
		);
	//}
};

