/*!
 * Copyright(c) 2010 Ciaran Jessup <ciaranj@gmail.com>
 * MIT Licensed
 */
var  Base= require("./base"),
	crypto= require('crypto'),
	authutils= require('../_authutils');
	
var md5 = function(str) {
		return crypto.createHash('md5').update(str).digest('hex');
	};

Digest= module.exports= function (options) {
	options= options || {}
  	var strategy = Base(options),
  		realm = options.realm || "secure",
  		getPasswordForUser = options.getPasswordForUser,
		idDelimiter = options.idDelimiter || ":";

  	strategy.name = options.name || "digest";
  
	strategy.authenticate= function(req, res, callback) {
    	var self= this,
			authHeader= req.headers.authorization,
			isDigest=  /^[D]igest\s.+"/.exec(authHeader);
    
		if(isDigest) {
      		var credentials= authutils.splitAuthorizationHeader(authHeader),
				method= req.method,
				href= req.url;
				
      		getPasswordForUser(credentials.username, function(error, password){
        		if(error) callback(error);
        		else {
          			var HA1= md5( credentials.username+":"+ realm + ":"+ password),
						HA2= md5( method+ ":" + href ),
						myResponse= md5(HA1 + ":"+ credentials.nonce + ":"+ HA2 );
          
					if( myResponse == credentials.response ) {
						self.success({ 
							strategyUserId: credentials.username,
							strategyName: strategy.name,
							userId: strategy.name + idDelimiter + credentials.username,
							userName : credentials.username
						}, callback);
					}
					else {
						strategy._unAuthenticated(self, req, res, callback)
					}
        		}
      		});
    	} else {
      		strategy._unAuthenticated(self, req, res, callback)
    	}
	}; 
  
	strategy.getAuthenticateResponseHeader= function( executionScope ) {
    	return "Digest realm=\"" + realm.replace("\"","\\\"") + "\", nonce=\""+ authutils.getNonce(32)+"\"";
	};
  
  return strategy;
};