/*!
 * Copyright(c) 2010 Ciaran Jessup <ciaranj@gmail.com>
 * MIT Licensed
 */
var Base= require("./base");
var Digest= require('./digest');
var Basic= require('./basic'); 

Http = module.exports= function (options) {
  	options = options || {};
  	var strategy = Base(options),
		basicStrategy = options.basicStrategy || (options.useBasic != false) ? Basic(options) : null,
  		digestStrategy = options.digestStrategy || (options.useDigest != false) ? Digest(options) : null;

  	strategy.name = options.name || "http";

	if( basicStrategy ) basicStrategy.embedded= true;
	if( digestStrategy ) digestStrategy.embedded= true;  

  	strategy.isValid = function() {
		return ( digestStrategy !== undefined || basicStrategy !== undefined )
	};

  	strategy.getAuthenticateResponseHeader = function( executionScope ) {
		var challenges= "";
     	if( digestStrategy ) challenges+= digestStrategy.getAuthenticateResponseHeader( executionScope );
     	if( digestStrategy && basicStrategy ) challenges+= ", ";
     	if( basicStrategy ) challenges+= basicStrategy.getAuthenticateResponseHeader( executionScope );
     	return challenges;
   	};
   
   	strategy.authenticate= function(req, res, callback) {
		var authHeader=  req.headers.authorization;
      	if( authHeader ) {
        	if( authHeader.match(/^[Bb]asic.*/)  && basicStrategy ) {
          		basicStrategy.authenticate.call(this, req, res, callback);
        	} else if( authHeader.match(/^[Dd]igest.*/) && digestStrategy ) {
				digestStrategy.authenticate.call(this, req, res, callback);
        	} else {  
          		strategy._badRequest( this, req, res, callback );
        	}
      	}  else  {
        	strategy._unAuthenticated( this, req, res, callback );
      	}
  	};
  
  	return strategy;
};