/**
 * lastSession
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	req.session.lastSession = null;
	RingSession.post(
		{
			"SessionId":'AppSession',
			"currentState":'login',
			"method":'select',
			"procedure":'getLastTradingSessionStats'
		},
		function(error,response) {
			return parserService.parse(error,response,
				function(err){
					logService.debug(err);
					return next();
				},
				function(result){
					var companies = [];
					_.each(req.session.transactions,function(tr){
						if(companies.indexOf(tr.BuyClient)==-1) companies.push(tr.BuyClient);
						if(companies.indexOf(tr.SellClient)==-1) companies.push(tr.SellClient);
					});
					if(result.Rows.length>0) {
					req.session.lastSession = result.Rows[0];
					req.session.lastSession.participants = companies;
					}
					else {
						//req.session.lastSession = null;
					}
					return next();
				}
			);
		}
	);
};
