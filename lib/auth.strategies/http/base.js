/*!
 * Copyright(c) 2010 Ciaran Jessup <ciaranj@gmail.com>
 * MIT Licensed
 */
Base = module.exports= function () {
  var strategy = {};

  	strategy._badRequest= function(executionScope, req, res, callback) {
		res.writeHead(400, { 'Content-Type': 'text/plain' });
    	res.end('Bad Request');
    	executionScope.halt(callback);
  	};
  
	strategy._unAuthenticated= function(executionScope, req, res, callback) {  
    	res.writeHead(401, { 
			'Content-Type': 'text/plain',
			'WWW-Authenticate': this.getAuthenticateResponseHeader(executionScope) 
		});
    	res.end("Authorization Required");
    	executionScope.halt(callback);
  	};
  
	return strategy;
};
