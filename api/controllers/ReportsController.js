/**
 * ReportsController
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
		var title = 'Rapoarte si statistici';
		var section = 'reports';
		var msg = '';
 
		if(req.method=="POST") {
			GridReport.post(
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'select',
					"procedure":'getReportDataSet',
					"objects":
					[
						{
							"Arguments":
							{
								"ReportName": req.param('ReportType'),
								"StartDate": req.param('StartDate'),
								"EndDate": req.param('EndDate')
							}
						}
					]
				},
				function(error,result) {
				// Error handling
				  if (error) {
					console.log('BUUUUU:'+error);
					return res.view({ title:title, section:section, msg:error, reporttypes:req.session.reportTypes});

				  // The Book was found successfully!
				  } else {
					toolsService.parseResponse(result,function(msg) {
						console.log('success but failed:'+msg);
						return res.view({ title:title, section:section, msg:msg, reporttypes:req.session.reportTypes});
					},
					function(resultObject) {
						return res.view({ title:title, section:section, msg:msg, reporttypes:req.session.reportTypes, table:resultObject.Columns, data:resultObject.Rows});
					});
				  }
			});
		}
		else return res.view({ title:title, section:section, msg:msg, reporttypes:req.session.reportTypes});
  },
	
	download:function(req,res) {
		if(!req.param('id')) return res.send(404);
		else {
			Report.post(
				{
					"SessionId":req.sessionID,
					"currentState":'login',
					"method":'generatereport',
					"procedure":'Transaction',
					"objects":
					[
						{
							"Arguments":
							{
								"ID_Transaction": req.param('id')
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
						res.setHeader('Content-disposition', 'attachment; filename="' + resultObject.FileName + '"');
						res.setHeader('Content-type', 'application/pdf')
						var buf = new Buffer(resultObject.Base64Data, 'base64');;
						return res.send(buf);
					});
				  }
			});
		
			//return res.download('assets/robots.txt','BRM-'+req.param('id')+'.pdf');
		}
	},

  /**
   *     ANRE Report
   */

   anre: function (req, res) {
		var title = "Raport ANRE";
		var section = 'reports';
		var msg = '';
		if(req.method=='POST') {
			Report.post(
				{
					"SessionId":req.sessionID,
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
				function(error,result) {
				// Error handling
				  if (error) {
					console.log('BUUUUU:'+error);
						return res.view({ title:title, section:section, msg:error});

				  // The Book was found successfully!
				  } else {
					toolsService.parseResponse(result,function(msg) {
						console.log('success but failed:'+msg);
						return res.view({ title:title, section:section, msg:msg});
					},
					function(resultObject) {
						//console.log(resultObject.Rows);
						//req.session.marketOrders = resultObject.Rows;
						res.setHeader('Content-disposition', 'attachment; filename="' + resultObject.FileName + '"');
						res.setHeader('Content-type', 'application/pdf')
						var buf = new Buffer(resultObject.Base64Data, 'base64');;
						return res.send(buf);
					});
				  }
			});
		}
		else return res.view({ title:title, section:section, msg:msg});
  },
  
  

  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to OrdersController)
   */
  _config: {}

  
};
