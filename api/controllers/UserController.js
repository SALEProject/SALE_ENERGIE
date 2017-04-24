/**
 * UserController
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
	*    `/user/index`
	*/
	index: function (req, res) {
		var users = [];
		if(Object.keys(sails.io.sockets.sockets).length>0) {
			_.each(Object.keys(sails.io.sockets.sockets), function(session) {
				  var idx = toolsService.searchItemInArray(session,sails.storage.sessions,'id');
				  if(idx>-1) {
					users.push(sails.storage.sessions[idx].user);
				  }
			});
		}
		return res.json({Success: true, ResultType: 'Array', Result: users});
	},

	/**
	* Action blueprints:
	*    `/user/login`
	*/
	login: function (req, res) {
		if(req.session.authenticated) {
			if(Object.keys(sails.storage.users).indexOf(req.sessionID)==-1) {
				sails.storage.users[req.sessionID] = req.session.currentUser;
			}
			if(req.session.currentUser.isAdministrator) return res.redirect('/admin');
			else return res.redirect('/');
		}
		var errorMsg = ''
		if(req.method == 'POST') {
			Login.post(
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'login',
					"objects":[
						{
							"Login":{
								"LoginName":req.param('txtusername'),
								"LoginPassword":req.param('txtpassword'),
								"CertificateFingerprint":'',
								"EntryPoint":"BTGN"
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							return res.view({layout:'login', title:'Login', errorMsg:err, transactions:req.session.transactions.slice(-5,req.session.transactions.length).reverse(), lastSession:req.session.lastSession});
						},
						function(result){
							var roles = JSON.parse(result.User.ID_UserRole);
							Login.post(
								{
									"SessionId":req.sessionID,
									"currentState":'login',
									"method":'login',
									"objects":[
										{
											"Login":{
												"LoginName":req.param('txtusername'),
												"LoginPassword":req.param('txtpassword'),
												"CertificateFingerprint":'',
												"EntryPoint":"BTGN",
												"ID_UserRole":roles[0]
											}
										}
									]
								},
								function(error,response) {
									return parserService.parse(error,response,
										function(err){
											return res.view({layout:'login', title:'Login', errorMsg:err, transactions:req.session.transactions.slice(-5,req.session.transactions.length).reverse(), lastSession:req.session.lastSession});
										},
										function(result2){
											req.session.authenticated = true;
											req.session.currentUser = result2.User;
											sails.storage.users[req.sessionID] = result2.User;
											if(result2.User.isAdministrator) return res.redirect('/admin');
											else return res.redirect('/');
										}
									);
								}
							);
						}
					);
				}
			);
		}
		else {
			return res.view({layout:'login', title:'Login', errorMsg:errorMsg, transactions:req.session.transactions.slice(-5,req.session.transactions.length).reverse(), lastSession:req.session.lastSession});
		}
	},

	/**
	* Action blueprints:
	*    `/user/logout`
	*/
	logout: function (req, res) {
		req.session.authenticated = false;
		req.session.currentUser = null;
		req.session.destroy();
		if(sails.storage.users.hasOwnProperty(sessionService.getSessionID(req))) delete sails.storage.users[sessionService.getSessionID(req)];
		return res.redirect('/login');
	},
	
	
	whitelist: function (req,res) {
		Whitelist.post(
			{
				"SessionId":req.sessionID,
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
				return res.view({layout:'account', title:'Parteneri tranzactionare', msg:errorMsg, items:[]});

			  // The Book was found successfully!
			  } else {
				toolsService.parseResponse(result,function(msg) {
					return res.view({layout:'account', title:'Parteneri tranzactionare', msg:msg, items:[]});
				},
				function(resultObject) {
					return res.view({layout:'account', title:'Parteneri tranzactionare', msg:'', items:resultObject.Rows});
				});
			  }
		});
	},

	whitelistSave: function (req,res) {
		if(!req.param('id')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'id\''});
		if(!req.param('checked')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'checked\''});
		if(req.method == 'POST') {
			Whitelist.post(
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'execute',
					"procedure":"setWhitelist",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_AgreedClient": req.param('id')*1,
								"isAgreed": (req.param('checked')=='true'?true:false)
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
	* Overrides for the settings in `config/controllers.js`
	* (specific to UserController)
	*/
	_config: {}
};
