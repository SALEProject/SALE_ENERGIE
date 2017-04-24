exports.getMarketParams = function(callback) {
	if(typeof sails.processes.market == 'undefined') sails.processes.market = false;
	if(!sails.processes.market) {
		sails.processes.market = true;
		if(typeof sails.storage.market == 'undefined') sails.storage.market = {};
		//if(typeof sails.storage.market.Items == 'undefined') sails.storage.market.Items = [];
		//if(typeof sails.storage.market.Ids == 'undefined') sails.storage.market.Ids = [];
		/*if(typeof sails.storage.market.LastTimestamp == 'undefined') {
			var since = new Date();
			since.setHours(0,0,0);
			sails.storage.chat.LastTimestamp = since;
		}*/
		Market.post(
			{
				"SessionId":'AppSession',
				"currentState":'login',
				"method":'select',
				"procedure":'getMarketParameters'
			},
			function(error,result) {
			// Error handling
			  if (error) {
				console.log('BUUUUU:'+error);
				return callback();

			  // The Book was found successfully!
			  } else {
				toolsService.parseResponse(result,function(msg) {
					console.log('success but failed:'+msg);
					return callback();
				},function(resultObject) {
					if(resultObject.Rows.length>0) {
						sails.storage.market = resultObject.Rows[0];
						if(typeof callback =='undefined') Market.publishUpdate(1, sails.storage.market);
					}
					sails.processes.market = false;
					if(typeof callback !='undefined') return callback();
				});
			  }
			}
		);
	}
};

exports.getChat = function(callback) {
	if(typeof sails.processes.chat == 'undefined') sails.processes.chat = false;
	if(!sails.processes.chat) {
		sails.processes.chat = true;
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
				"SessionId":'AppSession',
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
				return callback();

			  // The Book was found successfully!
			  } else {
				toolsService.parseResponse(result,function(msg) {
					console.log('success but failed:'+msg);
					return callback();
				},function(resultObject) {
					_.each(resultObject.Rows,function(item){
						if(sails.storage.chat.Ids.indexOf(item.ID)==-1) {
							console.log('new chat message!!');
							sails.storage.chat.Ids.push(item.ID);
							sails.storage.chat.Items.push(item);
							sails.storage.chat.LastTimestamp = new Date(item.Date);
							if(typeof callback =='undefined') Chat.publishCreate({id:item.ID, item:item});
						}
					});
					sails.processes.chat = false;
					if(typeof callback !='undefined') return callback();
				});
			  }
			}
		);
	}
};

exports.getOrders = function(callback) {
	if(typeof sails.processes.orders == 'undefined') sails.processes.orders = false;
	if(!sails.processes.orders) {
		sails.processes.orders = true;
		if(typeof sails.storage.orders == 'undefined') sails.storage.orders = {};
		if(typeof sails.storage.orders.Items == 'undefined') sails.storage.orders.Items = [];
		if(typeof sails.storage.orders.Ids == 'undefined') sails.storage.orders.Ids = [];
		Order.post(
			{
				"SessionId":'AppSession',
				"currentState":'login',
				"method":'select',
				"procedure":'getOrders',
				"objects":[
					{
						"Arguments":
						{
							"all": true
						}
					}
				]
			},
			function(error,result) {
			// Error handling
			  if (error) {
				console.log('BUUUUU:'+error);
				if(typeof callback !='undefined') return callback();
			  // The Book was found successfully!
			  } else {
				toolsService.parseResponse(result,function(msg) {
					console.log('success but failed:'+msg);
					if(typeof callback !='undefined') return callback();
				},function(resultObject) {
					_.each(resultObject.Rows,function(item){
						if(toolsService.searchIdInArray(item.ID,sails.storage.orders.Items)==-1 && item.isActive && !item.isTransacted) {
							//sails.storage.orders.Ids.push(item.ID);
							sails.storage.orders.Items.push(item);
							if(typeof callback =='undefined') Order.publishCreate({id:item.ID, item:item});
						}
					});
					sails.processes.orders = false;
					if(typeof callback !='undefined') return callback();
				});
			  }
			}
		);
	}
};


exports.getAlerts = function(callback) {
	if(typeof sails.processes.alerts == 'undefined') sails.processes.alerts = false;
	if(!sails.processes.alerts) {
		sails.processes.alerts = true;
		if(typeof sails.storage.alerts == 'undefined') sails.storage.alerts = {};
		if(typeof sails.storage.alerts.Items == 'undefined') sails.storage.alerts.Items = {};
		if(typeof sails.storage.alerts.Ids == 'undefined') sails.storage.alerts.Ids = [];
		if(typeof sails.storage.alerts.LastTimestamp == 'undefined') {
			var since = new Date();
			since.setHours(-24,0,0);
			sails.storage.alerts.LastTimestamp = since;
		}
		logService.debug('fetching alerts..');
		Alert.post(
			{
				"SessionId":'AppSession',
				"currentState":'login',
				"method":'select',
				"procedure":'getAlerts',
				"objects":[
					{
						"Arguments":
						{
							"Since":sails.storage.alerts.LastTimestamp.toISOString()
						}
					}
				]
			},
			function(error,result) {
			// Error handling
			  if (error) {
				console.log('BUUUUU:'+error);
				if(typeof callback !='undefined') return callback();
			  } else {
				toolsService.parseResponse(result,function(msg) {
					console.log('success but failed:'+msg);
					if(typeof callback !='undefined') return callback();
				},function(resultObject) {
					logService.debug('found '+resultObject.Rows.length+' alerts..');
					_.each(resultObject.Rows,function(item){
						if(sails.storage.alerts.Ids.indexOf(item.ID)==-1) {
							sails.storage.alerts.Ids.push(item.ID);
							sails.storage.alerts.Items[item.ID] = item;
							sails.storage.chat.LastTimestamp = new Date(item.Date);
							if(typeof callback =='undefined') Alert.publishCreate({id:item.ID, item:item});
						}
					});
					logService.debug('total alerts: '+sails.storage.alerts.Ids.length);
					sails.processes.alerts = false;
					if(typeof callback !='undefined') return callback();
				});
			  }
			}
		);
	}
};

exports.getEvents = function(callback) {
	if(typeof sails.processes.events == 'undefined') sails.processes.events = false;
	if(!sails.processes.events) {
		sails.processes.events = true;
		if(typeof sails.storage.events == 'undefined') sails.storage.events = {};
		if(typeof sails.storage.events.Items == 'undefined') sails.storage.events.Items = {};
		if(typeof sails.storage.events.Ids == 'undefined') sails.storage.events.Ids = [];
		if(typeof sails.storage.events.LastTimestamp == 'undefined') {
			var since = new Date();
			since.setHours(0,0,0);
			sails.storage.events.LastTimestamp = since;
		}
		Event.post(
			{
				"SessionId":'AppSession',
				"currentState":'login',
				"method":'select',
				"procedure":'getEvents',
				"objects":[
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
				if(typeof callback !='undefined') return callback();
			  // The Book was found successfully!
			  } else {
				toolsService.parseResponse(result,function(msg) {
					console.log('success but failed:'+msg);
					if(typeof callback !='undefined') return callback();
				},function(resultObject) {
					var counter = 0;
					_.each(resultObject.Rows,function(item){
						if(sails.storage.events.Ids.indexOf(item.ID)==-1) {
							sails.storage.events.Ids.push(item.ID);
							sails.storage.events.Items[item.ID] = item;
						}
						counter++;
					});
					while(true) {
						if(counter==sails.storage.events.Ids.length) {
							sails.processes.events = false;
							if(typeof callback !='undefined') return callback();
						}
					}
				});
			  }
			}
		);
	}
};

exports.startEventsTimer = function(callback) {
	if(typeof sails.timers.events == 'undefined') {
		sails.timers.events = setInterval(function(){
			if(!sails.processes.events) {
				sails.processes.events = true;
				logService.debug('running events update');
				Event.post(
					{
						"SessionId":'AppSession',
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
						//return callback();

					  // The Book was found successfully!
					  } else {
						  toolsService.parseResponse(result,function(msg) {
							console.log('success but failed:'+msg);
							//return callback();
						  },function(resultObject) {
							var newIds = [];
							var newItems = {};
							_.each(resultObject.Rows,function(item){
								newIds.push(item.ID);
								newItems[item.ID] = item;
								if(sails.storage.events.Ids.indexOf(item.ID)==-1) {
									console.log('new event: '+item.ID+' '+item.EventType+' '+item.Resource);
									sails.storage.events.Ids.push(item.ID);
									sails.storage.events.Items[item.ID] = item;
									sails.storage.events.LastTimestamp = new Date(item.Date);
									switch(item.Resource) {
										case 'Orders':
											switch(item.EventType) {
												case 'insert':
												case 'update':
												case 'delete':
													//get order details, add it to orders list and send socket message
													eventService.addOrder(item.ID_Resource);
													break;
											}
											break;
										case 'OrderMatches':
											// send socket message that order has matches
											eventService.addOrder(item.ID_LinkedResource);
											break;
										case 'Journal':
											// send socket message with new activity log
											eventService.addJournal(item.ID_Resource);
											break;
										case 'Transactions':
											// send socket message that new transaction is available
											Transaction.publishCreate({id:item.ID_Resource});
											//RingSession.publishUpdate(1,{});
											break;
										case 'Alerts':
											// update alerts
											eventService.getAlerts();
											//RingSession.publishUpdate(1,{});
											break;
										case 'Messages':
											// update chat list
											eventService.getChat();
											break;
										case 'Markets':
											// send socket message that new market chart data is available
											eventService.getMarketParams();
											Market.publishCreate({id:item.ID_Resource});
											break;
										case 'RingSessions':
											// send socket message to update ring session stats
											RingSession.publishCreate({id:item.ID_Resource});
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
	return callback();
};

exports.addOrder = function(id) {
	Order.post({
			"SessionId":'AppSession',
			"currentState":'login',
			"method":'select',
			"procedure":'getOrderDetails',
			"objects":[
				{
					"Arguments":
					{
						"ID_Order": id,
						"all": true
					}
				}
			]
		},
		function (error,result) {
			// Error handling
			if (error) {
				console.log('BUUUUU:'+error);
			}
			else {
				toolsService.parseResponse(result,function(msg) {
					console.log('success but failed:'+msg);
					},function(resultObject) {
						_.each(resultObject.Rows,function(item){
							if(toolsService.searchIdInArray(item.ID,sails.storage.orders.Items)==-1) {
								if(item.isTransacted && !item.isActive) {
									Order.publishCreate({id:item.ID, item:item});
								}
								else if(!item.isTransacted && !item.isActive) {
									Order.publishDestroy(item.ID);
								}
								else {
									sails.storage.orders.Items.push(item);
									Order.publishCreate({id:item.ID, item:item});
								}
							}
							else {
								if(!item.isTransacted && !item.isActive) {
									var idx = toolsService.searchIdInArray(item.ID,sails.storage.orders.Items);
									sails.storage.orders.Items.splice(idx,1);
									Order.publishDestroy(item.ID);
								}
								if(item.isTransacted && !item.isActive) {
									var idx = toolsService.searchIdInArray(item.ID,sails.storage.orders.Items);
									sails.storage.orders.Items.splice(idx,1);
									Order.publishCreate({id:item.ID,item:item});
								}
								else {
									sails.storage.orders.Items[toolsService.searchIdInArray(item.ID,sails.storage.orders.Items)] = item;
									Order.publishCreate({id:item.ID,item:item});
								}
							}
						});
						/*
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
						*/
				})
			}
		}
	);
};

exports.addJournal = function(id) {
	Journal.post(
		{
			"SessionId":'AppSession',
			"currentState":'login',
			"method":'select',
			"procedure":'getJournal',
			"objects":
			[
				{
					"Arguments":
					{
						"ID_Journal": id
					}
				}
			]
		},
		function(error,result) {
		// Error handling
		  if (error) {
			console.log('BUUUUU:'+error);
		  // The Book was found successfully!
		  } else {
			toolsService.parseResponse(result,function(msg) {
				console.log('success but failed:'+msg);
			},
			function(resultObject) {
				if(resultObject.Rows.length>0) {
					var item = resultObject.Rows[0];
					Journal.publishCreate({id:item.ID,item:item});
				}
			});
		  }
	});
};

exports.getActiveOrdersCount = function() {
	if(typeof sails.storage.orders!='undefined') {
		var count = 0;
		_.each(sails.storage.orders.Items,function(item) {
			if(typeof item!='undefined' && item.isActive) count++;
		});
		return count;
	}
};

exports.getLastTransactions = function() {
	if(typeof sails.storage.orders!='undefined') {
		var count = 0;
		_.each(sails.storage.orders.Items,function(item) {
			if(typeof item!='undefined' && item.isActive) count++;
		});
		return count;
	}
};