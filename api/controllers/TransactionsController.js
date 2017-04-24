/**
 * OrdersController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    
	index: function(req,res) {
		var title = 'Istoric tranzactii';
		var section = 'transactions';
		var msg = '';
		var view_all = false;
		var since = false;
		var moment = require('moment');
  
		if(!req.isSocket) return res.view({ title:title, section:section, msg:msg});
		else {
			if(typeof req.session.socketSessionsReverse != 'undefined' && !(req.socket.id in req.session.socketSessionsReverse)) {
				return res.json({success:false,error:'unknown connection id'});
			}
			if(typeof req.session.socketSessionsReverse != 'undefined' && req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});
			if(req.param('all')) view_all = req.param('all');
			var arguments = {
				"all": view_all
			}
			if(req.param('since') && req.param('since') != '') {
				var date1 = moment(req.param('since'),'YYYY-MM-DD');
				arguments.Since = date1.format('YYYY-MM-DDTHH:mm:ss.SSS')
			}

			Transaction.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getTransactions',
					"objects":[
						{
							"Arguments": arguments
						}
					]
				},
				function(error,result) {
				// Error handling
				  if (error) {
					console.log('BUUUUU:'+error);
						return res.json({success:false, error:error});

				  // The Book was found successfully!
				  } else {
					toolsService.parseResponse(result,function(msg) {
						console.log('success but failed:'+msg);
						return res.json({success:false, error:msg});
					},
					function(resultObject) {
						//console.log(resultObject.Rows);
						//req.session.marketOrders = resultObject.Rows;
						return res.json({success:true,data:resultObject.Rows});
					});
				  }
			});
		}
	},


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to OrdersController)
   */
  _config: {}

  
};
