exports.getSessionID = function(req) {
	if(req.isSocket) return req.socket.handshake.sessionID;
	else return req.sessionID;
};
exports.getSession = function(req) {
	if(req.isSocket) req.socket.handshake.session;
	else return req.session;
};
