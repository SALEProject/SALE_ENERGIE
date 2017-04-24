var moment = require('moment');

module.exports = {
  
	index: function (req, res) {
		return res.view({layout:'adminLayout', title:'Panou de control - '+sails.config.appName});
	},


	/**
	*     Users
	*/

	users: function (req, res) {
		var title = 'Utilizatori - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		Login.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'getusers'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view({layout:layout, title:title, users:[]});
					},
					function(result){
						return res.view({layout:layout, title:title, users:result.Rows});
					}
				);
			}
		);
	},
  
	user_add: function (req, res) {
		var message = '';
		var title = 'Adauga utilizator - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		if(req.method == 'POST') {
			Login.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'adduser',
					"objects":[
						{
							"Arguments":{
								"LoginName":req.param('LoginName'),
								"LoginPassword":req.param('LoginPassword'),
								"Email":req.param('Email'),
								"FirstName":req.param('FirstName'),
								"LastName":req.param('LastName'),
								"ID_Agency":req.param('ID_Agency')*1,
								"ID_UserRole":(req.param('ID_UserRole')?req.param('ID_UserRole'):'0')*1
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view({layout:layout, title:title, item:req.body});
						},
						function(result){
							req.flash('success','Utilizatorul a fost adaugat cu succes!');
							return res.redirect('/admin/users');
						}
					);
				}
			);
		}
		else return res.view({layout:layout, title:title});
	},

	user_edit: function (req, res) {
		var message = '';
		var title = 'Modificare utilizator - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if( req.method == 'POST') {
			Login.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'edituser',
					"objects":[
						{
							"Arguments":{
								"ID_User":req.param('id')*1,
								"LoginName":req.param('LoginName'),
								"LoginPassword":req.param('LoginPassword'),
								"Email":req.param('Email'),
								"FirstName":req.param('FirstName'),
								"LastName":req.param('LastName'),
								"ID_Agency":req.param('ID_Agency')*1,
								"ID_UserRole":(req.param('ID_UserRole')?req.param('ID_UserRole'):'0')*1
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view('admin/user_add',{layout:layout, title:title, item:req.body});
						},
						function(result){
							req.flash('success','Utilizatorul a fost modificat cu succes!');
							return res.redirect('/admin/users');
						}
					);
				}
			);
		}
		else {
			Login.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'getusers'
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view('admin/user_add',{layout:layout, title:title});
						},
						function(result){
							var user;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) user = item; 
							});
							if(!user) return res.send(500,'User not found!');
							else return res.view('admin/user_add',{layout:layout, title:title, item:user});
						}
					);
				}
			);
		}
	},

	user_delete: function (req, res) {
		var message = '';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		Login.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'deleteuser',
				"service":'/BRMLogin.svc',
				"objects":[
					{
						"Arguments":{
							"ID_User":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/users');
					},
					function(result){
						req.flash('success','Utilizatorul a fost sters cu succes!');
						return res.redirect('/admin/users');
					}
				);
			}
		);
	},

	/**
	*     Agencies
	*/

	agencies: function (req, res) {
		var message = '';
		var title = 'Agenctii - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		Agency.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getAgencies'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view({layout:layout, title:title, items:[]});
					},
					function(result){
						return res.view({layout:layout, title:title, items:result.Rows});
					}
				);
			}
		);
	},
  
  
	agency_add: function (req, res) {
		var message = '';
		var title = 'Adaugare agentie - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		if(req.method == 'POST') {
			Agency.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addAgency',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"Code":req.param('Code'),
								"Name":req.param('Name'),
								"FiscalCode":req.param('FiscalCode'),
								"RegisterCode":req.param('RegisterCode'),
								"CompanyName":req.param('CompanyName')
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view({layout:layout, title:title, item:req.body});
						},
						function(result){
							req.flash('success','Agentia a fost adaugata cu succes!');
							return res.redirect('/admin/agencies');
						}
					);
				}
			);
		}
		else return res.view({layout:layout, title:title, item:{}});
	},

	agency_edit: function (req, res) {
		var title = 'Modificare agentie - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
			Agency.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editAgency',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Agency":req.param('id')*1,
								"Code":req.param('Code'),
								"Name":req.param('Name'),
								"FiscalCode":req.param('FiscalCode'),
								"RegisterCode":req.param('RegisterCode'),
								"CompanyName":req.param('CompanyName')
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view('admin/agency_add',{layout:layout, title:title, item:req.body});
						},
						function(result){
							req.flash('success','Agentia a fost modificata cu succes!');
							return res.redirect('/admin/agencies');
						}
					);
				}
			);
		}
		else {
			Agency.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getAgencies',
					"objects":[{
						"Arguments":{
							ID_Agency:req.param('id')*1
						}
					}]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view('admin/agency_add',{layout:layout, title:title, item:{}});
						},
						function(result){
							var agency;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) agency = item; 
							});
							if(!agency) return res.send(500,'Agency not found!');
							return res.view('admin/agency_add',{layout:layout, title:title, item:agency});
						}
					);
				}
			);
		}
	},

	agency_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		Agency.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteAgency',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_Agency":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/agencies');
					},
					function(result){
						req.flash('success','Agentia a fost stearsa cu succes!');
						return res.redirect('/admin/agencies');
					}
				);
			}
		);
	},

	/**
	*     Parameters
	*/

	parameters: function (req, res) {
		var title = 'Parametri sesiune tranzactionare - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		Market.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getMarketParameters'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view({layout:layout, title:title, parameters:[]});
					},
					function(result){
						if(result.Rows.length>0) {
							var parameters = result.Rows[0];
							if(req.method == 'POST') {
								Market.post(
									{
										"SessionId":sessionService.getSessionID(req),
										"currentState":'login',
										"method":'execute',
										"procedure":'setMarketParameters',
										"service":'/BRMWrite.svc',
										"objects":[
											{
												"Arguments":{
													"Code":req.param('Code'),
													"PreOpeningTime":req.param('PreOpeningTime'),
													"OpeningTime":req.param('OpeningTime'),
													"PreClosingTime":req.param('PreClosingTime'),
													"ClosingTime":req.param('ClosingTime'),
													"MinQuantity":req.param('MinQuantity')*1,
													"MaxPriceVariation":req.param('MaxPriceVariation')*1,
													"QuantityStepping":req.param('QuantityStepping')*1,
													"PriceStepping":req.param('PriceStepping')*1,
													"StartDeliveryDateOffset":req.param('StartDeliveryDateOffset')*1,
													"EndDeliveryDateOffset":req.param('EndDeliveryDateOffset')*1,
													"DaysOfWeek":{
														"dayMonday":req.param('DaysOfWeek_dayMonday')==1?true:false,
														"dayTuesday":req.param('DaysOfWeek_dayTuesday')==1?true:false,
														"dayWednesday":req.param('DaysOfWeek_dayWednesday')==1?true:false,
														"dayThursday":req.param('DaysOfWeek_dayThursday')==1?true:false,
														"dayFriday":req.param('DaysOfWeek_dayFriday')==1?true:false,
														"daySaturday":req.param('DaysOfWeek_daySaturday')==1?true:false,
														"daySunday":req.param('DaysOfWeek_daySunday')==1?true:false,
													}
												}
											}
										]
									},
									function(error,response) {
										return parserService.parse(error,response,
											function(err){
												req.flash('error',err);
												return res.view({layout:layout, title:title, parameters:parameters, post:req.body});
											},
											function(result){
												req.flash('success','Parametri au fost salvati cu succes!');
												return res.redirect('/admin/parameters');
											}
										);
									}
								);
							}
							else return res.view({layout:layout, title:title, parameters:parameters});
						}
						else return res.send('No market found!',500);
					}
				);
			}
		);
	},
  
	/**
	*     ANRE Report
	*/

	anre: function (req, res) {
		var title = 'Raport ANRE - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		if(req.method=='POST') {
			Report.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'generatereport',
					"procedure":'ANRE_Report',
					"objects":
					[
						{
							"Arguments":
							{
								"prm_StartDate": req.param('prm_StartDate'),
								"prm_EndDate": req.param('prm_EndDate')
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view({layout:layout, title:title});
						},
						function(result){
							res.setHeader('Content-disposition', 'attachment; filename="' + result.FileName + '"');
							res.setHeader('Content-type', 'application/pdf')
							var buf = new Buffer(result.Base64Data, 'base64');;
							return res.send(buf);
						}
					);
				}
			);
		}
		else return res.view({layout:layout, title:title});
	},
  
  
	/**
	*     Billing
	*/

	billing: function (req, res) {
		var title = 'Situatie facturare - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		if(req.method=='POST') {
			Report.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'generatereport',
					"procedure":'SITUATIE_FACTURARE',
					"objects":
					[
						{
							"Arguments":
							{
								"prm_StartDate": req.param('prm_StartDate'),
								"prm_EndDate": req.param('prm_EndDate')
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view({layout:layout, title:title});
						},
						function(result){
							res.setHeader('Content-disposition', 'attachment; filename="' + result.FileName + '"');
							res.setHeader('Content-type', 'application/pdf')
							var buf = new Buffer(result.Base64Data, 'base64');;
							return res.send(buf);
						}
					);
				}
			);
		}
		else return res.view({layout:layout, title:title});
	},
  
  
	/**
	*     Activity log
	*/

	activity: function (req, res) {
		var title = 'Raport activitate - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		var currentUser = req.param('user')?req.param('user')*1:null;
		var currentAgency = req.param('agency')?req.param('agency')*1:null;
		var startDate = req.param('startdate')?req.param('startdate'):new moment().format('YYYY-MM-DD');
		var endDate = null;
		Event.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'select',
				"procedure":'getJournal',
				"objects":
				[
					{
						"Arguments":
						{
							"ID_User": currentUser,
							"ID_Agency": currentAgency,
							"Since": startDate
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view({layout:layout, title:title, items:[], currentUser:currentUser, currentAgency:currentAgency, startDate:startDate, endDate:endDate});
					},
					function(result){
						return res.view({layout:layout, title:title, items:result.Rows, currentUser:currentUser, currentAgency:currentAgency, startDate:startDate, endDate:endDate});
					}
				);
			}
		);
	},
  
  
	/**
	*     EntryPoints
	*/

	entrypoints: function (req, res) {
		var title = 'Puncte de intrare - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		EntryPoint.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getEntryPoints'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view({layout:layout, title:title, items:[]});
					},
					function(result){
						return res.view({layout:layout, title:title, items:result.Rows});
					}
				);
			}
		);
	},
  
	point_add: function (req, res) {
		var title = 'Adaugare punct de intrare - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		if(req.method == 'POST') {
			EntryPoint.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addEntryPoint',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_County":req.param('ID_County')*1,
								"PhysicalPointCode":req.param('PhysicalPointCode'),
								"PhysicalPointName":req.param('PhysicalPointName'),
								"VirtualPointCode":req.param('VirtualPointCode'),
								"VirtualPointName":req.param('VirtualPointName'),
								"VirtualEntryPointCode":req.param('VirtualEntryPointCode'),
								"VirtualEntryPointName":req.param('VirtualEntryPointName'),
								"AdjacentNetworkOperator":req.param('AdjacentNetworkOperator'),
								"AdjacentNetworkOperatorType":req.param('AdjacentNetworkOperatorType'),
								"Locality":req.param('Locality'),
								"LowerSirutaCode":req.param('LowerSirutaCode'),
								"UpperSirutaCode":req.param('UpperSirutaCode'),
								"TerritorialBranch":req.param('TerritorialBranch'),
								"Sector":req.param('Sector'),
								"TechnologicalMinimumPressure":req.param('TechnologicalMinimumPressure'),
								"TechnologicalMinimumUM":req.param('TechnologicalMinimumUM'),
								"TechnologicalMaximumPressure":req.param('TechnologicalMaximumPressure'),
								"TechnologicalMaximumUM":req.param('TechnologicalMaximumUM'),
								"AnnualAverageGrossCalorificValue":req.param('AnnualAverageGrossCalorificValue'),
								"AnnualUM":req.param('AnnualUM'),
								"TechnologicalCapacity":req.param('TechnologicalCapacity'),
								"TechnologicalCapacityUM":req.param('TechnologicalCapacityUM'),
								"CountyCode":req.param('CountyCode'),
								"CountyName":req.param('CountyName'),
								"GNTypes": _.toArray(_.map(req.param('GNTypes'),function(x){ return x*1; }))
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view({layout:layout, title:title, item:{}});
						},
						function(result){
							req.flash('success','Punctul de intrare a fost adaugat cu succes!');
							return res.redirect('/admin/entrypoints');
						}
					);
				}
			);
		}
		else return res.view({layout:layout, title:title, item:{}});
	},

	point_edit: function (req, res) {
		var title = 'Modificare punct de intrare - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
			EntryPoint.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editEntryPoint',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_EntryPoint":req.param('id')*1,
								"ID_County":req.param('ID_County')*1,
								"PhysicalPointCode":req.param('PhysicalPointCode'),
								"PhysicalPointName":req.param('PhysicalPointName'),
								"VirtualPointCode":req.param('VirtualPointCode'),
								"VirtualPointName":req.param('VirtualPointName'),
								"VirtualEntryPointCode":req.param('VirtualEntryPointCode'),
								"VirtualEntryPointName":req.param('VirtualEntryPointName'),
								"AdjacentNetworkOperator":req.param('AdjacentNetworkOperator'),
								"AdjacentNetworkOperatorType":req.param('AdjacentNetworkOperatorType'),
								"Locality":req.param('Locality'),
								"LowerSirutaCode":req.param('LowerSirutaCode'),
								"UpperSirutaCode":req.param('UpperSirutaCode'),
								"TerritorialBranch":req.param('TerritorialBranch'),
								"Sector":req.param('Sector'),
								"TechnologicalMinimumPressure":req.param('TechnologicalMinimumPressure'),
								"TechnologicalMinimumUM":req.param('TechnologicalMinimumUM'),
								"TechnologicalMaximumPressure":req.param('TechnologicalMaximumPressure'),
								"TechnologicalMaximumUM":req.param('TechnologicalMaximumUM'),
								"AnnualAverageGrossCalorificValue":req.param('AnnualAverageGrossCalorificValue'),
								"AnnualUM":req.param('AnnualUM'),
								"TechnologicalCapacity":req.param('TechnologicalCapacity'),
								"TechnologicalCapacityUM":req.param('TechnologicalCapacityUM'),
								"CountyCode":req.param('CountyCode'),
								"CountyName":req.param('CountyName'),
								"GNTypes": _.toArray(_.map(req.param('GNTypes'),function(x){ return x*1; }))
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view('admin/point_add',{layout:layout, title:title, item:{}});
						},
						function(result){
							req.flash('success','Punctul de intrare a fost modificat cu succes!');
							return res.redirect('/admin/entrypoints');
						}
					);
				}
			);
		}
		else {
			EntryPoint.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getEntryPoints',
					"objects":[{
						"Arguments":{
							ID_EntryPoint:req.param('id')*1
						}
					}]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view('admin/point_add',{layout:layout, title:title, item:{}});
						},
						function(result){
							var point;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) point = item; 
							});
							if(!point) return res.send(500,'Punctul de intrare nu a fost gasit.');
							else return res.view('admin/point_add',{layout:layout, title:title, msg:message, item:point});
						}
					);
				}
			);
		}
	},

	point_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		EntryPoint.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteEntryPoint',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_EntryPoint":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/entrypoints');
					},
					function(result){
						req.flash('success','Punctul de intrare a fost sters cu succes!');
						return res.redirect('/admin/entrypoints');
					}
				);
			}
		);
	},

	/**
	*     Whitelist reaons
	*/

	whitelist: function (req, res) {
		var title = 'Motive refuzare tranzactionare - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		Whitelist.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getWhitelistReasons'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view({layout:layout, title:title, items:[]});
					},
					function(result){
						return res.view({layout:layout, title:title, items:result.Rows});
					}
				);
			}
		);
	},
  
	/**
	*     Whitelist requests
	*/

	whitelist_requests: function (req, res) {
		var title = 'Cereri refuzare tranzactionare - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		Whitelist.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'dashboard',
				"method":'select',
				"procedure":'getWhitelistRequests'
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.view({layout:layout, title:title, items:[]});
					},
					function(result){
						return res.view({layout:layout, title:title, items:result.Rows});
					}
				);
			}
		);
	},
  
	whitelist_add: function (req, res) {
		var title = 'Adaugare motiv refuzare tranzactionare - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		if(req.method == 'POST') {
			Whitelist.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'addWhitelistReason',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"Reason":req.param('Reason')
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view({layout:layout, title:title, item:req.body});
						},
						function(result){
							req.flash('success','Inregistrarea a fost adaugata cu succes!');
							return res.redirect('/admin/whitelist');
						}
					);
				}
			);
		}
		else return res.view({layout:layout, title:title});
	},

	whitelist_request_approve: function (req, res) {
		Whitelist.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'approveWhitelistRequest',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_Request":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/whitelist');
					},
					function(result){
						message = 'Cererea a fost aprobata cu succes!';
						return res.redirect('/admin/whitelist');
					}
				);
			}
		);
	},

	whitelist_edit: function (req, res) {
		var title = 'Modificare motiv refuzare tranzactionare - Panou de control - '+sails.config.appName;
		var layout = 'adminLayout';
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		if(req.method == 'POST') {
			Whitelist.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'execute',
					"procedure":'editWhitelistReason',
					"service":'/BRMWrite.svc',
					"objects":[
						{
							"Arguments":{
								"ID_Reason":req.param('id')*1,
								"Reason":req.param('Reason')
							}
						}
					]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view('admin/whitelist_add',{layout:layout, title:title, item:req.body});
						},
						function(result){
							req.flash('success','Inregistrarea a fost modificata cu succes!');
							return res.redirect('/admin/whitelist');
						}
					);
				}
			);
		}
		else {
			Whitelist.post(
				{
					"SessionId":sessionService.getSessionID(req),
					"currentState":'login',
					"method":'select',
					"procedure":'getWhitelistReasons',
					"objects":[{
						"Arguments":{
							"ID_Reason":req.param('id')*1
						}
					}]
				},
				function(error,response) {
					return parserService.parse(error,response,
						function(err){
							req.flash('error',err);
							return res.view('admin/whitelist_add',{layout:layout, title:title, item:{}});
						},
						function(result){
							var point;
							_.each(result.Rows,function(item){
								if(item.ID==req.param('id')) point = item; 
							});
							if(!point) return res.send(500,'Whitelist reason not found!');
							else return res.view('admin/whitelist_add',{layout:layout, title:title, item:point});
						}
					);
				}
			);
		}
	},

	whitelist_delete: function (req, res) {
		if(!req.param('id')) return res.send(500,'Missing ID parameter!');
		Whitelist.post(
			{
				"SessionId":sessionService.getSessionID(req),
				"currentState":'login',
				"method":'execute',
				"procedure":'deleteWhitelistReason',
				"service":'/BRMWrite.svc',
				"objects":[
					{
						"Arguments":{
							"ID_Reason":req.param('id')*1
						}
					}
				]
			},
			function(error,response) {
				return parserService.parse(error,response,
					function(err){
						req.flash('error',err);
						return res.redirect('/admin/whitelist');
					},
					function(result){
						req.flash('success','Inregistrarea a fost stearsa cu succes!');
						return res.redirect('/admin/whitelist');
					}
				);
			}
		);
	},

	_config: {}
};
