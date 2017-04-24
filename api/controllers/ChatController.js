/**
 * OrderController
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
    
   index: function (req, res) {
		if(typeof sails.storage.chat != 'undefined' && typeof sails.storage.chat.Items != 'undefined') var items = sails.storage.chat.Items;
		else var items = [];	
		return res.json({success:true,data:items});
  },
  
	post: function(req,res) {
		if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});
		Chat.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"service":'/BRMWrite.svc',
				"procedure":'addChatMessage',
				"objects":
				[
					{
						"Arguments":
						{
							"Message": req.param('message')
						}
					}
				]
			},
			function(error,result) {
			// Error handling
			  if (error) {
				if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') errorMsg = 'Connection timeout. Please try again later.';
				else message = error;
				console.log('BUUUUU:'+error);
				return res.json({success:false,error:error});

			  // The Book was found successfully!
			  } else {
				toolsService.parseResponse(result,function(msg) {
					return res.json({success:false,error:msg});
				},
				function(resultObject) {
				//console.log(req.session.currentUser);
					if(resultObject>0) {
						//if(sails.chatMessages.indexOf(resultObject)==-1) Chat.publishCreate({id:resultObject, Message:req.param('message'), LoginName:req.session.currentUser.LoginName, Date: toolsService.getCurrentTime()});
						//Chat.publishCreate({id:resultObject, Message:req.param('message'), LoginName:req.session.currentUser.LoginName, Date: toolsService.getCurrentTime()});
						return res.json({success:true,result:resultObject});
					}
					else return res.json({success:false,error:resultObject});
				});
			  }
		});
	},

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to OrderController)
   */
  _config: {}

  
};
