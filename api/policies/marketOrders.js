/**
 * marketOrders
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {
	if(typeof sails.storage.orders == 'undefined') sails.storage.orders = {};
	if(typeof sails.storage.orders.Items == 'undefined') sails.storage.orders.Items = {};
	if(typeof sails.storage.orders.Ids == 'undefined') sails.storage.orders.Ids = [];
	sails.processes.orders = false;
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
						"all": true
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
				if(!sails.processes.orders) {
					_.each(resultObject.Rows,function(item){
						if(sails.storage.orders.Ids.indexOf(item.ID)==-1) {
							sails.storage.orders.Ids.push(item.ID);
							sails.storage.orders.Items[item.ID] = item;
							Order.publishCreate({id:item.ID, ID:item.ID, item:item});
						}
					});
					if(typeof sails.timers.orders == 'undefined') {
						sails.timers.orders = setInterval(function(){
							if(!sails.processes.orders) {
								sails.processes.orders = true;
								logService.debug('running orders update');
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
													"all": true
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
							}
							sails.processes.orders = false;
						},2000);
					}
				}
				return next();
			});
		  }
		}
	);
};
