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

		if(typeof sails.storage.orders != 'undefined' && typeof sails.storage.orders.Items != 'undefined') var items = _.toArray(sails.storage.orders.Items);
		else var items = [];	
		return res.json({success:true,data:items});
	
		//console.log('/orders/index requested by '+req.socket.id);
			//console.log('session id for socket: '+req.session.socketSessionsReverse[req.socket.id]);
		if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) {
		/*
		if(!(req.socket.id in req.session.socketSessionsReverse)) {
			//console.log(req.session.socketSessionsReverse);
			return res.json({success:false,error:'unknown connection id'});
		}
		if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});
		*/
		Order.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getOrders',
				"objects":[
					{
						"Arguments":
						{
							"all": (req.param('all')?req.param('all'):false)
						}
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
	},

   /**
   * Action blueprints:
   *    `/orders/add`
   */
   destroy: function (req, res) {
		//MarketOrder.publishDestroy(3);
		return res.json({});
	},

  /**
   * Action blueprints:
   *    `/orders/add`
   */
   add: function (req, res) {
   
	if(req.isAjax) {
		var type = req.param('Direction');
		if(req.method == 'POST') {
		//console.log(req.body);
			var moment = require('moment');
			var date1 = moment(req.param('StartDeliveryDate'),'DD MMM YYYY').add('seconds',10);
			var date2 = moment(req.param('EndDeliveryDate'),'DD MMM YYYY').add('seconds',10);
			//var date2 = new Date(Date.parse(req.param('EndDate')));
			//console.log('session id:'+req.sessionID);
			//console.log(_.map(req.param('EntryPoints'),function(x){ return x*1; }));
			Order.post(
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'execute',
					"procedure":"addOrder",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"Direction": req.param('Direction'),
								"Quantity": req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
								"Price": req.param('Price').replace(/\./g,'').replace(',','.')*1,
								"StartDeliveryDate": date1.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"EndDeliveryDate": date2.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"ID_GNType": req.param('ID_GNType')*1,
								"CombinationsAccepted":  ((type=='S' && req.param('CombinationsAccepted')=='1')?true:false),
								"doNotifyPartners":  (req.param('doNotifyPartners')=='1'?true:false),
								"EntryPoints": _.toArray(_.map(req.param('EntryPoints'),function(x){ return x*1; }))
							}
						}
					]
				},
				function(error,result) {
				// Error handling
				  if (error) {
					if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
					else message = error;
					console.log('BUUUUU:'+error);
					return res.json({Success:false,ResultType:'GeneralError',Result:message});

				  // The Book was found successfully!
				  } else {
					//console.log('addOrder result:'+sails.util.inspect(result));
					toolsService.parseResponse(result,function(msg) {
						return res.json(result);
					},
					function(resultObject) {
						//message = 'Ordinul a fost validat cu succes!';
						//return res.view({title:'Adauga ordin - Bursa de tranzactionare gaze', msg:message, type:type});
						return res.json({Success:true});
					});
				  }
			});
		}
	else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
	}
	else {

	  var message = '';
		var type = req.param('type');
		if(req.method == 'POST') {
			var moment = require('moment');
			var date1 = moment(req.param('StartDeliveryDate'),'DD MMM YYYY').add('seconds',10);
			var date2 = moment(req.param('EndDeliveryDate'),'DD MMM YYYY').add('seconds',10);
			//var date2 = new Date(Date.parse(req.param('EndDate')));
			//console.log('session id:'+req.sessionID);
			Order.post(
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'execute',
					"procedure":"addOrder",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"Direction": (type=='buy'?'B':'S'),
								"Quantity": req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
								"Price": req.param('Price').replace(/\./g,'').replace(',','.')*1,
								"StartDeliveryDate": date1.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"EndDeliveryDate": date2.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"ID_GNType": req.param('ID_GNType')*1,
								"CombinationsAccepted":  ((type=='sell' && req.param('CombinationsAccepted')=='1')?true:false),
								"EntryPoints": _.toArray(_.map(req.param('EntryPoints'),function(x){ return x*1; }))
							}
						}
					]
				},
				function(error,result) {
				// Error handling
				  if (error) {
					if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
					else message = error;
					console.log('BUUUUU:'+error);
					return res.view({title:'Adauga ordin - Bursa de tranzactionare gaze', msg:message, type:type});

				  // The Book was found successfully!
				  } else {
					//console.log('addOrder result:'+sails.util.inspect(result));
					toolsService.parseResponse(result,function(msg) {
						return res.view({title:'Adauga ordin - Bursa de tranzactionare gaze', msg:msg, type:type});
					},
					function(resultObject) {
						message = 'Ordinul a fost salvat cu succes!';
						//return res.view({title:'Adauga ordin - Bursa de tranzactionare gaze', msg:message, type:type});
						return res.redirect('/');
					});
				  }
			});
		}
	else return res.view({ layout:'iframe', title:'Adauga ordin - Bursa de tranzactionare gaze', msg:message, type:type});
	}
  },

  /**
   * Action blueprints:
   *    `/orders/validate`
   */
   validate: function (req, res) {

	  var message = '';
		var type = req.param('Direction');
		if(req.method == 'POST') {
			var moment = require('moment');
			var date1 = moment(req.param('StartDeliveryDate'),'DD MMM YYYY').add('seconds',10);
			var date2 = moment(req.param('EndDeliveryDate'),'DD MMM YYYY').add('seconds',10);
			//var date2 = new Date(Date.parse(req.param('EndDate')));
			//console.log('session id:'+req.sessionID);
			Order.post(
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'execute',
					"procedure":"validateOrder",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"Direction": req.param('Direction'),
								"Quantity": req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
								"Price": req.param('Price').replace(/\./g,'').replace(',','.')*1,
								"StartDeliveryDate": date1.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"EndDeliveryDate": date2.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"ID_GNType": req.param('ID_GNType')*1,
								"CombinationsAccepted":  ((type=='S' && req.param('CombinationsAccepted')=='1')?true:false)
							}
						}
					]
				},
				function(error,result) {
				// Error handling
				  if (error) {
					if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
					else message = error;
					console.log('BUUUUU:'+error);
					return res.json({Success:false,ResultType:'GeneralError',Result:message});

				  // The Book was found successfully!
				  } else {
					//console.log('addOrder result:'+sails.util.inspect(result));
					toolsService.parseResponse(result,function(msg) {
						return res.json(result);
					},
					function(resultObject) {
						message = 'Ordinul a fost validat cu succes!';
						//return res.view({title:'Adauga ordin - Bursa de tranzactionare gaze', msg:message, type:type});
						return res.json({Success:true});
					});
				  }
			});
		}
	else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
  },

  /**
   * Action blueprints:
   *    `/orders/cancel`
   */
   cancel: function (req, res) {
		if(!req.param('id')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'id\''});
		var message = '';
		if(req.method == 'POST') {
			Order.post(
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'execute',
					"procedure":"cancelOrder",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Order": req.param('id')*1
							}
						}
					]
				},
				function(error,result) {
				// Error handling
				  if (error) {
					if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
					else message = error;
					console.log('BUUUUU:'+error);
					return res.json({Success:false,ResultType:'GeneralError',Result:message});

				  // The Book was found successfully!
				  } else {
					//console.log('addOrder result:'+sails.util.inspect(result));
					toolsService.parseResponse(result,function(msg) {
						return res.json(result);
					},
					function(resultObject) {
						message = 'Ordinul a fost anulat cu succes!';
						//return res.view({title:'Adauga ordin - Bursa de tranzactionare gaze', msg:message, type:type});
						return res.json({Success:true});
					});
				  }
			});
		}
		else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
  },

  /**
   * Action blueprints:
   *    `/orders/precheck`
   */
   precheck: function (req, res) {

	  var message = '';
		var type = req.param('Direction');
		if(req.method == 'POST') {
			var moment = require('moment');
			var date1 = moment(req.param('StartDeliveryDate'),'DD MMM YYYY'); //.add('seconds',10);
			var date2 = moment(req.param('EndDeliveryDate'),'DD MMM YYYY'); //.add('seconds',10);
			//var date2 = new Date(Date.parse(req.param('EndDate')));
			//console.log('session id:'+req.sessionID);
			Order.post(
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'select',
					"procedure":"getOrderPrecheck",
					"service":'/BRMRead.svc',
					"objects":[
						{
							"Arguments":{
								"Direction": req.param('Direction'),
								"Quantity": req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
								"Price": req.param('Price').replace(/\./g,'').replace(',','.')*1,
								"StartDeliveryDate": date1.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"EndDeliveryDate": date2.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"ID_GNType": req.param('ID_GNType')*1,
								"CombinationsAccepted":  ((type=='S' && req.param('CombinationsAccepted')=='1')?true:false)
							}
						}
					]
				},
				function(error,result) {
				// Error handling
				  if (error) {
					if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
					else message = error;
					console.log('BUUUUU:'+error);
					return res.json({Success:false,ResultType:'GeneralError',Result:message});

				  // The Book was found successfully!
				  } else {
					//console.log('addOrder result:'+sails.util.inspect(result));
					toolsService.parseResponse(result,function(msg) {
						return res.json(result);
					},
					function(resultObject) {
						return res.json({Success:true,data:resultObject.Rows});
					});
				  }
			});
		}
		else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
  },

  /**
   * Action blueprints:
   *    `/orders/accept`
   */
   accept: function (req, res) {

		if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		/*
		if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});
		*/
		if(!req.param('id')) return res.json({success:false,error:'missing parameter \'id\''});
		
		Order.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"service":'/BRMWrite.svc',
				"procedure":'acceptOrderMatch',
				"objects":
				[
					{
						"Arguments":
						{
							"ID_OrderMatch": req.param('id')
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
				console.log(resultObject);
					if(resultObject>0) {
						//if(sails.chatMessages.indexOf(resultObject)==-1) Chat.publishCreate({id:resultObject, Message:req.param('message'), LoginName:req.session.currentUser.LoginName, Date: toolsService.getCurrentTime()});
						//Chat.publishCreate({id:resultObject, Message:req.param('message'), LoginName:req.session.currentUser.LoginName, Date: toolsService.getCurrentTime()});
						Order.publishDestroy(req.param('id'));
						//Transaction.publishCreate({id:req.param('id'),type:);
						return res.json({success:true,result:resultObject});
					}
					else return res.json({success:false,error:resultObject});
				});
			  }
		});
  },

  /**
   * Action blueprints:
   *    `/orders/edit`
   */
   edit: function (req, res) {

	if(req.isAjax) {
		var type = req.param('Direction');
		if(req.method == 'POST') {
			var moment = require('moment');
			var date1 = moment(req.param('StartDeliveryDate'),'DD MMM YYYY').add('seconds',10);
			var date2 = moment(req.param('EndDeliveryDate'),'DD MMM YYYY').add('seconds',10);
			//var date2 = new Date(Date.parse(req.param('EndDate')));
			//console.log('session id:'+req.sessionID);
			Order.post(
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'execute',
					"procedure":"modifyOrder",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Order": req.param('id')*1,
								"Direction": req.param('Direction'),
								"Quantity": req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
								"Price": req.param('Price').replace(/\./g,'').replace(',','.')*1,
								"StartDeliveryDate": date1.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"EndDeliveryDate": date2.format('YYYY-MM-DDTHH:mm:ss.SSS'),
								"ID_GNType": req.param('ID_GNType')*1,
								"CombinationsAccepted":  ((req.param('Direction')=='S' && req.param('CombinationsAccepted')=='1')?true:false),
								"EntryPoints": _.toArray(_.map(req.param('EntryPoints'),function(x){ return x*1; }))
							}
						}
					]
				},
				function(error,result) {
				// Error handling
				  if (error) {
					if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
					else message = error;
					console.log('BUUUUU:'+error);
					return res.json({Success:false,ResultType:'GeneralError',Result:message});

				  // The Book was found successfully!
				  } else {
					//console.log('addOrder result:'+sails.util.inspect(result));
					toolsService.parseResponse(result,function(msg) {
						return res.json(result);
					},
					function(resultObject) {
						//message = 'Ordinul a fost validat cu succes!';
						//return res.view({title:'Adauga ordin - Bursa de tranzactionare gaze', msg:message, type:type});
						return res.json({Success:true});
					});
				  }
			});
		}
		else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
	}
	else {
	  var message = '';
		if(!req.param('id')) return res.send('Missing ID parameter!',500);
		Order.post(
			{
				"SessionId":req.sessionID,
				"currentState":'login',
				"method":'select',
				"procedure":'getOrderDetails',
				"objects":[
					{
						"Arguments":
						{
							"ID_Order": req.param('id')
						}
					}
				]
			},
			function(error,result) {
			// Error handling
			  if (error) {
				console.log('BUUUUU:'+error);
					return res.send(error,500);

			  // The Book was found successfully!
			  } else {
				toolsService.parseResponse(result,function(msg) {
					return res.send(msg,500);
				},
				function(resultObject) {
					//console.log(resultObject.Rows);
					//req.session.marketOrders = resultObject.Rows;
					var item = null;
					for(var i=0;i<resultObject.Rows.length;i++) {
						if(req.param('id')==resultObject.Rows[i].ID) {
							item = resultObject.Rows[i];
							break;
						}
					}
					if(item) {
						if(req.method == 'POST') {
							var moment = require('moment');
							var date1 = moment(req.param('StartDeliveryDate'),'DD MMM YYYY').add('seconds',10);
							var date2 = moment(req.param('EndDeliveryDate'),'DD MMM YYYY').add('seconds',10);
							Order.post(
								{
									"SessionId":req.sessionID,
									"currentState":'login',
									"method":'execute',
									"service":'/BRMWrite.svc',
									"procedure":'modifyOrder',
									"objects":[
										{
											"Arguments":{
												"ID_Order": req.param('id')*1,
												"Direction": req.param('Direction'),
												"Quantity": req.param('Quantity').replace(/\./g,'').replace(',','.')*1,
												"Price": req.param('Price').replace(/\./g,'').replace(',','.')*1,
												"StartDeliveryDate": date1.format('YYYY-MM-DDTHH:mm:ss.SSS'),
												"EndDeliveryDate": date2.format('YYYY-MM-DDTHH:mm:ss.SSS'),
												"ID_GNType": req.param('ID_GNType')*1,
												"CombinationsAccepted":  ((req.param('Direction')=='S' && req.param('CombinationsAccepted')=='1')?true:false),
												"EntryPoints": _.toArray(_.map(req.param('EntryPoints'),function(x){ return x*1; }))
											}
										}
									]
								},
								function(error,result) {
								// Error handling
								  if (error) {
									if(error.hasOwnProperty('name') && error.name=='ConnectTimeoutError') message = 'Connection timeout. Please try again later.';
									else message = error;
									console.log('BUUUUU:'+error);
									return res.send('general error',500);
									return res.view({ layout:'iframe', title:'Modifica ordin - Bursa de tranzactionare gaze', msg:message, type:type, item:item});

								  // The Book was found successfully!
								  } else {
									toolsService.parseResponse(result,function(msg) {
										//return res.send('parse error',500);
										return res.view({ layout:'iframe', title:'Modifica ordin - Bursa de tranzactionare gaze', msg:msg, type:type, item:item});
									},
									function(resultObject) {
										message = 'Orderinul a fost modificat cu succes!';
										return res.redirect('/');
									});
								  }
							});
						}
						else return res.view({ layout:'iframe', title:'Modifica ordin - Bursa de tranzactionare gaze', msg:message, type:type, item:item});
					}
					else return res.send('Order not found!',500);
				});
			  }
		});
	}
	},
  
	matches: function(req,res) {
		//console.log('/orders/matches requested by '+req.socket.id);
			//console.log('session id for socket: '+req.session.socketSessionsReverse[req.socket.id]);
		if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) {
			/*
		if(!(req.socket.id in req.session.socketSessionsReverse)) {
			//console.log(req.session.socketSessionsReverse);
			return res.json({success:false,error:'unknown connection id'});
		}
		if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});
		*/
		if(!req.param('id')) return res.json({success:false,error:'missing order id'});
		Order.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getOrderMatches',
				"objects":[
					{
						"Arguments":
						{
							"ID_Order": req.param('id')
						}
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
					return res.json(resultObject.Rows);
				});
			  }
		});
	},

	transactions: function(req,res) {
		//console.log('/orders/transactions requested by '+req.socket.id);
			//console.log('session id for socket: '+req.session.socketSessionsReverse[req.socket.id]);
		if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) {
		/*if(!(req.socket.id in req.session.socketSessionsReverse)) {
			//console.log(req.session.socketSessionsReverse);
			return res.json({success:false,error:'unknown connection id'});
		}
		*/
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});
		if(!req.param('id')) return res.json({success:false,error:'missing order id'});
		Order.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getOrderTransactions',
				"objects":[
					{
						"Arguments":
						{
							"ID_Order": req.param('id')
						}
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
					return res.json(resultObject.Rows);
				});
			  }
		});
	},

   entrypoints: function (req, res) {
		if(!req.isSocket) return res.json({success:false,error:'bad connection type'});
		//if(!req.session.socketSessionsReverse.hasOwnProperty(req.socket.id)) return res.json({success:false,error:'unknown connection id'});
		//if(req.session.socketSessionsReverse[req.socket.id]=='') return res.json({success:false,error:'no valid session'});

		EntryPoint.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getOrderEntryPoints',
				"objects":
				[
					{
						"Arguments":
						{
							"ID_Order": req.param('id')
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


	
	/**
   * Overrides for the settings in `config/controllers.js`
   * (specific to OrdersController)
   */
  _config: {}

  
};
