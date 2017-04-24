exports.isEmpty = function(obj) {
    return !Object.keys(obj).length;
};
exports.getRingStatus = function(status) {
    switch(status) {
		case 'Closed':
			return 'inchisa';
			break;
		case 'Opened':
			return 'deschisa';
			break;
		case 'PreOpened':
			return 'in deschidere';
			break;
		case 'PreClosed':
			return 'in inchidere';
			break;
		case 'NONE':
			return 'inchisa';
			break;
	}
};
exports.getArrayItem = function(array,id,label) {
    for(var i=0;i<array.length;i++) {
		if(array[i].ID==id) {
			if(label) return array[i][label];
			else return array[i];
		}
	}
	return null;
};
exports.searchIdInArray = function(id,array) {
	var idx = -1;
    for(var i=0;i<array.length;i++) {
		if(array[i].ID==id) {
			idx = i;
			return i;
		}
	}
	return idx;
};
exports.searchItemInArray = function(id,array,label) {
	var idx = -1;
    for(var i=0;i<array.length;i++) {
		if(array[i][label]==id) {
			idx = i;
			return i;
		}
	}
	return idx;
};
exports.parseDate = function(dateText) {
	var d = new Date(dateText);
    return d.getDate()+'/'+d.getMonth()+'/'+d.getFullYear();
};
exports.getTime = function(dateText) {
	return dateText.substr(11,5);
	//var d = new Date(dateText);
    //return d.getHours()+':'+d.getMinutes();
};
exports.getCurrentTime = function() {
	var m = require('moment-timezone');
	return m.tz("Europe/Bucharest").format(); 
};
exports.getDateSince = function(seconds) {
	var moment = require('moment');
	return moment().subtract('seconds',seconds).format(); 
};
exports.parseResponse = function(response,error,success) {
	//console.log("result:"+ sails.util.inspect(response));
	if(response.Success || response.ErrorCode == 0) {
		//console.log('response.Success = true');
		if(response.ResultType=='LoginResult') {
			if(response.Result.Success) return success(response.Result);
			else return error(response.Result.Error);
		}
		else return success(response.Result);
	}
	else {
		//console.log('response.Success = false');
		if(response.ResultType=='String') return error(response.Result);
		else return error('Unknown error!'+sails.util.inspect(response));
	}
	return error('Unkown response format!');
};

exports.parse = function(error,result,cb_error,cb_success) {
	// Error handling
	  if (error) {
		console.log('BUUUUU:'+error);
		return next();

	  // The Book was found successfully!
	  } else {
		return toolsService.parseResponse(result,cb_error,cb_success);
	  }
};
exports.getFlashMessage = function(flash) {
	var html = '';
	var msg = '';
	var msg_class = '';
	if(Object.keys(flash).length>0) {
		if(flash.info) {
			msg_class = 'info';
			msg = flash.info;
		}
		if(flash.success) {
			msg_class = 'success';
			msg = flash.success;
		}
		if(flash.error) {
			msg_class = 'danger';
			msg = flash.error;
		}
		if(msg.length>0) {
			html = '<div class="alert alert-'+msg_class+'">'+
                  '<button class="close" data-dismiss="alert"></button>'+
                   msg +
				'</div>';
		}
	}
	return html;
};
