/*!
 * Copyright(c) 2010 Ciaran Jessup <ciaranj@gmail.com>
 * MIT Licensed
 */

var Base= require("./base")
var Base64= require("./base64")
var basicMatchRegex = /^[Bb]asic\s([a-zA-z0-9=]+)/;

Basic= module.exports = function (options) {
	options= options || {}
	var strategy = Base(options),
  		realm = options.realm || "test",
		getPasswordForUser = options.getPasswordForUser,
		idDelimiter = options.idDelimiter || ":";

	strategy.name = options.name || "basic";

	strategy.authenticate = function(request, response, callback) {
    	var self = this,
    		username,
			password,
			authHeader = request.headers.authorization,
			credentials = basicMatchRegex.exec(authHeader);
    
		if( credentials && credentials[1] ) {
      		var providedCredentials= Base64.decode(credentials[1]),
				splitCredentials= providedCredentials.split(":");
      		
			username= splitCredentials[0];
      		password= splitCredentials[1];
      
      		getPasswordForUser(username, function(error, pswd) {
        		if(error) {
					callback(error)
				} else {      
          			if( pswd == password) {
           				self.success({
							strategyName: strategy.name,
							strategyUserId: username,
							userName: username,
							userId: strategy.name + idDelimiter + username
						}, callback);
          			} else { 
           				strategy._unAuthenticated(self, request, response, callback)
          			}
        		}
      		});
    	} else {
      		strategy._unAuthenticated(self, request, response, callback);
    	}
	};

	strategy.getAuthenticateResponseHeader = function( ) {
		return "Basic realm=" + realm;
	}; 

  return strategy;
};