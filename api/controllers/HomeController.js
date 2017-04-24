/**
 * HomeController
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
    
	/**
	* Action blueprints:
	*    `/home/index`
	*    `/home`
	*/
	index: function (req, res) {
		var moment = require('moment');
		return res.view({title:'Bursa de tranzactionare gaze',time:new moment(),gntypes:req.session.gntypes,req:req});
	},


	/**
	* Action blueprints:
	*    `/home/subscribe`
	*/
	subscribe: function (req, res) {
		if(req.isSocket) {
			User.publishCreate({id:Date.now()});
			Order.subscribe(req.socket);
			OrderMatch.subscribe(req.socket);
			Alert.subscribe(req.socket);
			Chat.subscribe(req.socket);
			Transaction.subscribe(req.socket);
			RingSession.subscribe(req.socket);
			Market.subscribe(req.socket);
			Journal.subscribe(req.socket);
			User.subscribe(req.socket);
			sails.storage.sessions.push({id: req.socket.id, user: sails.storage.users[sessionService.getSessionID(req)]});
			return res.json({Success:true, ResultType:'string', Result: 'Successfully registered socket'});
		}
		else return res.json({Success:false, ResultType:'GeneralError', Result: 'Wrong connection type'});
	},


   alerts: function (req, res) {
		//if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});
		if(typeof sails.storage.alerts != 'undefined' && typeof sails.storage.alerts.Items != 'undefined') var items = sails.storage.alerts.Items;
		else var items = [];	
		return res.json({success:true,data:items});

		Alert.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getAlerts'
			},
			function(error,result) {
			// Error handling
			//console.log(result);
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
					return res.json({success:true,data:resultObject.Rows});
				});
			  }
		});
  },


   notifications: function (req, res) {
		//if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});
		Alert.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getNotifications',
				"objects": [
					{
						"Arguments": {
							"Since": (req.param('since') ? req.param('since') : '2014-01-01 00:00' )
						}
					}
				]
			},
			function(error,result) {
			// Error handling
			//console.log(result);
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
					return res.json({success:true,data:resultObject.Rows});
				});
			  }
		});
  },


   readnotification: function (req, res) {
		if(req.method!=='POST') return res.json({success:false,error:'bad request method'});
		if(!req.param('id')) return res.json({success:false,error:'missing param id'});
		Alert.post(
			{
				"SessionId":req.sessionID,
				"currentState":'login',
				"method":'execute',
				"service":"/BRMWrite.svc",
				"procedure":'setNotificationRead',
				"objects": [
					{
						"Arguments": {
							"ID_Notification": req.param('id')*1
						}
					}
				]
			},
			function(error,result) {
			// Error handling
			//console.log(result);
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
					return res.json({success:true,data:[]});
				});
			  }
		});
  },


   chart: function (req, res) {
		//if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});

		Transaction.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getMarketChartData'
			},
			function(error,result) {
			// Error handling
			//console.log(result);
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
					return res.json({success:true,data:resultObject.Rows});
				});
			  }
		});
  },

   stats: function (req, res) {
		//if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});

		RingSession.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getTradingSessionStats'
			},
			function(error,result) {
			// Error handling
			//console.log(result);
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
					if(resultObject.Rows.length>0) var item = resultObject.Rows[0];
					else var item = {};
					item.OrdersCount = eventService.getActiveOrdersCount();
					return res.json({success:true,data:item});
				});
			  }
		});
  },


   gntypes: function (req, res) {
		//if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});

		Order.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getGNTypes'
			},
			function(error,result) {
			// Error handling
			//console.log(result);
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
					return res.json({success:true,data:resultObject.Rows});
				});
			  }
		});
  },


   whitelist: function (req, res) {
		//if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});

		Whitelist.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getWhitelist'
			},
			function(error,result) {
			// Error handling
			  if (error) {
				if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') errorMsg = 'Connection timeout. Please try again later.';
				else errorMsg = error;
				console.log('BUUUUU:'+error);
					return res.json({success:false, error:error});

			  // The Book was found successfully!
			  } else {
				toolsService.parseResponse(result,function(msg) {
					return res.json({success:false, error:msg});
				},
				function(resultObject) {
					var items = [];
					for(var i=0;i<resultObject.Rows.length;i++) {
						if(resultObject.Rows[i].isAgreed || (!resultObject.Rows[i].isAgreed && !resultObject.Rows[i].isApproved)) items.push(resultObject.Rows[i].ID);
					}
					return res.json({success:true,data:items});
				});
			  }
		});
  },


   entrypoints: function (req, res) {
		//if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});

		EntryPoint.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getEntryPoints'
			},
			function(error,result) {
			// Error handling
			//console.log(result);
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
					return res.json({success:true,data:resultObject.Rows});
				});
			  }
		});
  },


   UserEntrypoints: function (req, res) {
		//if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});

		EntryPoint.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getEntryPoints'
			},
			function(error,result) {
			// Error handling
			//console.log(result);
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
					return res.json({success:true,data:resultObject.Rows});
				});
			  }
		});
  },


   time: function (req, res) {
		//if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});

		RingSession.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'servertime',
				"useResource":false
			},
			function(error,result) {
			// Error handling
			//console.log(result);
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
					return res.json({success:true,data:resultObject});
				});
			  }
		});
  },


   params: function (req, res) {
		//if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});

		return res.json({success:true,data:sails.storage.market});
  },

   journal: function (req, res) {
		//if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});

		var moment = require('moment');
		var currentUser = req.param('user')?req.param('user')*1:null;
		var currentAgency = req.param('agency')?req.param('agency')*1:null;
		var startDate = req.param('startdate')?req.param('startdate'):new moment().format('YYYY-MM-DD');
		var arguments = {};
		if(currentUser) arguments.ID_User = currentUser;
		if(currentAgency) arguments.ID_Agency = currentAgency;
		arguments.Since = startDate;
		Journal.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getJournal',
				"objects":
				[
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
					return res.json({success:false, error:error});
				},
				function(resultObject) {
					return res.json({success: true, data:resultObject.Rows});
				});
			  }
		});
  },
  
   users: function (req, res) {
		//if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});
		var users = [];
		if(Object.keys(sails.io.sockets.sockets).length>0) {
			_.each(Object.keys(sails.io.sockets.sockets), function(session) {
				  var idx = toolsService.searchItemInArray(session,sails.storage.sessions,'id');
				  if(idx>-1) {
					users.push(sails.storage.sessions[idx].user);
				  }
			});
		}
		return res.json({success: true, data:users});
  },
  


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to HomeController)
   */
  _config: {}

  
};
