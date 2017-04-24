exports.getAppSession = function(cb) {
	Login.post(
		{
			"SessionId":'AppSession',
			"currentState":'login',
			"method":'login',
			"objects":[
				{
					"Login":{
						"LoginName":'appuser',
						"LoginPassword":'appuser',
						"CertificateFingerprint":'',
						"EntryPoint":"BTGN"
					}
				}
			]
		},
		function(error,response) {
			return parserService.parse(error,response,
				function(err){
					console.log('something went wrong! '+err);
					sails.lower();
				},
				function(result){
					eventService.getMarketParams(function(){
						eventService.getChat(function(){
							eventService.getOrders(function(){
								eventService.getAlerts(function(){
									eventService.getEvents(function(){
										eventService.startEventsTimer(cb)
									})
								})
							})
						});
					});
				}
			);
		}
	);
};

