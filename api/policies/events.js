/**
 * events
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	if(typeof sails.storage.events == 'undefined') sails.storage.events = {};
	if(typeof sails.storage.events.Items == 'undefined') sails.storage.events.Items = {};
	if(typeof sails.storage.events.Ids == 'undefined') sails.storage.events.Ids = [];
	if(typeof sails.storage.events.LastTimestamp == 'undefined') {
		var since = new Date();
		since.setHours(0,0,0);
		sails.storage.events.LastTimestamp = since;
	}
	sails.processes.events = false;
	Event.post(
		{
			"SessionId":req.sessionID,
			"currentState":'login',
			"method":'select',
			"procedure":'getEvents',
			"objects":
			[
				{
					"Arguments":
					{
						"Since":sails.storage.events.LastTimestamp.toISOString()
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
				if(!sails.processes.events) {
					_.each(resultObject.Rows,function(item){
						if(sails.storage.events.Ids.indexOf(item.ID)==-1) {
							sails.storage.events.Ids.push(item.ID);
							sails.storage.events.Items[item.ID] = item;
							sails.storage.events.LastTimestamp = new Date(item.Date);
							//Order.publishCreate({id:item.ID, ID:item.ID, item:item});
						}
					});
					if(typeof sails.timers.events == 'undefined') {
						sails.timers.events = setInterval(function(){
							if(!sails.processes.events) {
								sails.processes.events = true;
								logService.debug('running events update');
								Event.post(
									{
										"SessionId":req.sessionID,
										"currentState":'login',
										"method":'select',
										"procedure":'getEvents',
										"objects":
										[
											{
												"Arguments":
												{
													"Since":sails.storage.events.LastTimestamp.toISOString()
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
											var newIds = [];
											var newItems = {};
											_.each(resultObject.Rows,function(item){
												newIds.push(item.ID);
												newItems[item.ID] = item;
												if(sails.storage.events.Ids.indexOf(item.ID)==-1) {
													console.log('new event!!');
													sails.storage.events.Ids.push(item.ID);
													sails.storage.events.Items[item.ID] = item;
													sails.storage.chat.LastTimestamp = new Date(item.Date);
													switch(item.Resource) {
														case 'Orders':
															switch(item.EventType) {
																case 'insert':
																case 'update':
																	//get order details, add it to orders list and send socket message
																	Order.post(
																		{
																			"SessionId":req.sessionID,
																			"currentState":'login',
																			"method":'select',
																			"procedure":'getOrders',
																			"objects":[
																				{
																					"Arguments":
																					{
																						"ID_Order": item.ID_Resource
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
																				var newIds = [];
																				var newItems = {};
																				_.each(resultObject.Rows,function(item){
																					newIds.push(item.ID);
																					newItems[item.ID] = item;
																					if(sails.storage.orders.Ids.indexOf(item.ID)==-1) {
																						console.log('new order!!');
																						sails.storage.orders.Ids.push(item.ID);
																						sails.storage.orders.Items[item.ID] = item;
																						Order.publishCreate({id:item.ID, item:item});
																					}
																					else if(JSON.stringify(sails.storage.orders.Items[item.ID]) !== JSON.stringify(item)) {
																						console.log('item changed '+item.ID);
																						sails.storage.orders.Items[item.ID] = item;
																						//Order.publishUpdate(item.ID,{item:item});
																						Order.publishCreate({id:item.ID,item:item});
																					}
																				});
																				var diff = _.difference(sails.storage.orders.Ids, newIds);
																				_.each(diff,function(id) {
																					console.log(sails.storage.orders.Items[id]);
																					if(typeof sails.storage.orders.Items[id] != 'undefined') {
																						sails.storage.orders.Items[id].isActive = true;
																						sails.storage.orders.Items[id].isTransacted = true;
																						//Order.publishUpdate(id,{item:sails.storage.orders.Items[id]});
																						Order.publishCreate({id:id,item:sails.storage.orders.Items[id]});
																						delete sails.storage.orders.Items[id];
																						sails.storage.orders.Ids.slice(sails.storage.orders.Ids.indexOf(id),sails.storage.orders.Ids.indexOf(id)+1);
																					}
																				});
																			  })
																		  }
																		}
																	);
																	break;
															}
															break;
														case 'OrderMatches':
															// send socket message that order has matches
															break;
														case 'Transactions':
															// send socket message that new transaction is available
															break;
														case 'Alerts':
															// get alert add it to storage and send socket message
															break;
														case 'Messages':
															// send socket message that new transaction is available
															break;
														case 'Markets':
															// send socket message that new transaction is available
															break;
														case 'RingSessions':
															// send socket message that new transaction is available
															break;
													}
												}
											});
										  })
									  }
									}
								);
							}
							sails.processes.events = false;
						},1000);
					}
				}
				return next();
			});
		  }
		}
	);
};
