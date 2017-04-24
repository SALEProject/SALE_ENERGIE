exports.checkState = function(currentState,state,req) {
	if(req.session.allowed_states.indexOf(state)>-1) return true;
	else return false;
};
exports.checkOperation = function(currentState,operation,req) {
	if(typeof req.session.allowed_operations != 'undefined' && Object.keys(req.session.allowed_operations).indexOf(currentState)>-1) {
		if(req.session.allowed_operations[currentState].indexOf(operation)>-1) return true;
		else return false;
	}
	else if(req.session.allowed_states.indexOf(currentState)>-1) return true;
	else return false;
};
