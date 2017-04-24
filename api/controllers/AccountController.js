/**
 * AccountController
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
	*    `/account/index`
	*/
	index: function (req, res) {
		var title = 'Contul meu';
		var section = 'profile';
		return res.view({ title:title, section:section});
	},

	/**
	* Action blueprints:
	*    `/account/whitelist`
	*/
	whitelist: function (req,res) {
		var title = 'Parteneri tranzactionare';
		var section = 'profile';
		var layout = 'accountLayout';
		Whitelist.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getWhitelist'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view({title:title, section:section, items:[]});
					},
					function(result){
						return res.view({title:title, section:section, items:result.Rows});
					}
				);
			}
		);
	},

	/**
	* Action blueprints:
	*    `/account/whitelist/save`
	*/
	whitelistSave: function (req,res) {
		if(!req.param('id')) return res.json({Success:false, ResultType:'GeneralError', Result:'missing parameter \'id\''});
		if(!req.param('checked')) return res.json({Success:false, ResultType:'GeneralError', Result:'missing parameter \'checked\''});
		if(req.method == 'POST') {
			Whitelist.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"setWhitelist",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_AgreedClient": req.param('id')*1,
								"isAgreed": (req.param('checked')=='true'?true:false),
								"ID_Reason": 0
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							if(typeof err == 'string') return res.json({Success:false, ResultType:'GeneralError', Result: err});
							else return res.json(err);
						},
						function(result){
							return res.json({Success:true});
						}
					);
				}
			);
		}
		else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
	},

	/**
	* Action blueprints:
	*    `/account/whitelistJson`
	*/
	whitelistJson: function (req, res) {
		Whitelist.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getWhitelist'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						return res.json({Success:false, ResultType: 'GeneralError', Result: error});
					},
					function(result){
						var items = [];
						for(var i=0;i<result.Rows.length;i++) {
							if(result.Rows[i].isAgreed) items.push(result.Rows[i].ID);
						}
						return res.json({Success:true, ResultType: 'Array', Result: items});
					}
				);
			}
		);
	},

	entrypoints: function (req,res) {
		var title = 'Puncte de intrare predefinite';
		var section = 'profile';
		var layout = 'accountLayout';
		EntryPoint.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getUserEntryPoints'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view({title:title, section:section, items:[]});
					},
					function(result){
						return res.view({title:title, section:section, items:result.Rows});
					}
				);
			}
		);
	},

	entrypoints_save: function (req,res) {
		if(!req.param('id')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'id\''});
		if(!req.param('checked')) return res.json({Success:false,ResultType:'GeneralError',Result:'missing parameter \'checked\''});
		if(req.method == 'POST') {
			EntryPoint.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":"setUserEntryPoint",
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_EntryPoint": req.param('id')*1,
								"isChecked": (req.param('checked')=='true'?true:false)
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							if(typeof err == 'string') return res.json({Success:false, ResultType:'GeneralError', Result: err});
							else return res.json(err);
						},
						function(result){
							return res.json({Success:true});
						}
					);
				}
			);
		}
		else return res.json({Success:false,ResultType:'GeneralError',Result:'no post data!'});
	},

	whitelistReasons: function(req,res) {
		Whitelist.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getWhitelistReasons'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						if(typeof err == 'string') return res.json({Success:false, ResultType:'GeneralError', Result: err});
						else return res.json(err);
					},
					function(result){
						var items = [];
						for(var i=0;i<result.Rows.length;i++) {
							if(result.Rows[i].isAgreed) items.push(result.Rows[i].ID);
						}
						return res.json({Success:true, ResultType: 'Array', Result: items});
					}
				);
			}
		);
	},

	notifications: function(req,res) {
		var title = 'Mesaje';
		var section = 'profile';
		var layout = 'accountLayout';
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
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view({title:title, section:section, items:[]});
					},
					function(result){
						return res.view({title:title, section:section, items:result.Rows});
					}
				);
			}
		);
	},

	/**
   * Overrides for the settings in `config/controllers.js`
   * (specific to UserController)
   */
  _config: {}

  
};
