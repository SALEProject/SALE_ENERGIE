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
	//req.session.chatHistory = null;
	//req.session.chatMessages = [];
	if(typeof sails.storage.chat == 'undefined') sails.storage.chat = {};
	if(typeof sails.storage.chat.Items == 'undefined') sails.storage.chat.Items = [];
	if(typeof sails.storage.chat.Ids == 'undefined') sails.storage.chat.Ids = [];
	if(typeof sails.storage.chat.LastTimestamp == 'undefined') {
		var since = new Date();
		since.setHours(0,0,0);
		sails.storage.chat.LastTimestamp = since;
	}
	Chat.post(
		{
			"SessionId":req.sessionID,
			"currentState":'login',
			"method":'select',
			"procedure":'getChatHistory',
			"objects":
			[
				{
					"Arguments":
					{
						"Since":sails.storage.chat.LastTimestamp.toISOString()
					}
				}
			]
		},
		function(error,result) {
		// Error handling
		  if (error) {
			console.log('BUUUUU:'+error);
			return next();

		  // The Book was found successfully!
		  } else {
			toolsService.parseResponse(result,function(msg) {
				console.log('success but failed:'+msg);
				return next();
			},function(resultObject) {
				_.each(resultObject.Rows,function(item){
					if(sails.storage.chat.Ids.indexOf(item.ID)==-1) {
						sails.storage.chat.Ids.push(item.ID);
						sails.storage.chat.Items.push(item);
						sails.storage.chat.LastTimestamp = new Date(item.Date);
						Chat.publishCreate({id:item.ID, item:item});
					}
				});
				if( typeof sails.timers.chat == 'undefined') {
					sails.timers.chat = setInterval(function(){
						logService.debug('running chat update');
						Chat.post(
							{
								"SessionId":req.sessionID,
								"currentState":'login',
								"method":'select',
								"procedure":'getChatHistory',
								"objects":
								[
									{
										"Arguments":
										{
											"Since":sails.storage.chat.LastTimestamp.toISOString()
										}
									}
								]
							},
							function (error,result) {
							// Error handling
							  if (error) {
								console.log('BUUUUU:'+error);
								return next();

							  // The Book was found successfully!
							  } else {
								  toolsService.parseResponse(result,function(msg) {
									console.log('success but failed:'+msg);
									return next();
								  },function(resultObject) {
									//console.log(resultObject.Rows.length);
									//req.session.chatHistory = resultObject.Rows;
									//sails.chatHistory = resultObject.Rows;
									_.each(resultObject.Rows,function(item){
										if(sails.storage.chat.Ids.indexOf(item.ID)==-1) {
											sails.storage.chat.Ids.push(item.ID);
											sails.storage.chat.Items.push(item);
											sails.storage.chat.LastTimestamp = new Date(item.Date);
											Chat.publishCreate({id:item.ID, item:item});
										}
									});
								  })
							  }
							}
						);
					},1000);
				}
				return next();
			});
		  }
		}
	);
};
