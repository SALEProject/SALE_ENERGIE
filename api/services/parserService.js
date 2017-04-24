exports.parse = function(error,response,cb_error,cb_success) {
	if (error) {
		return cb_error(error);
	}
	else {
		if((response.hasOwnProperty('Success') && response.Success) || (response.hasOwnProperty('ErrorCode') && response.ErrorCode == 0)) {
			if(response.ResultType=='LoginResult') {
				if(response.Result.Success) return cb_success(response.Result);
				else return cb_error(response.Result.Error);
			}
			else return cb_success(response.Result);
		}
		else {
			if(response.ResultType=='String') return cb_error(response.Result);
			else if(response.ResultType=='JSONKeyValuePairStruct') return cb_error(response);
			else if(response.ResultType=='Array') return cb_error(response.Result);
			else return cb_error('Unknown error! ('+response.ResultType+': '+response);
		}
		loggerService.error('Unkown response format!:'+response);
		return cb_error('Unkown response format!');
	}
};
