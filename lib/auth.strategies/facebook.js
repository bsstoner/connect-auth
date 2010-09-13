/*!
 * Copyright(c) 2010 Ciaran Jessup <ciaranj@gmail.com>
 * MIT Licensed
 */
var OAuth= require("oauth").OAuth2,
    url = require("url"),
    connect = require("connect"),
	http = require('http');

Facebook= module.exports= function(options, server) {
	options= options || {}
  	var strategy = {
		name: options.name || "facebook"
	},
  	oAuth= new OAuth(options.appId,  options.appSecret,  "https://graph.facebook.com"),
	redirectUri= options.callback,
  	scope= options.scope || "",
	idDelimiter = options.idDelimiter || ":";

  
  // Build the authentication routes required 
	strategy.setupRoutes = function(server) {
  		server.use('/', connect.router(function routes(app){
    		app.get('/auth/facebook_callback', function(req, res){
      			req.authenticate([that.name], function(error, authenticated) {
        			res.writeHead(303, { 'Location': req.session.facebook_redirect_url });
        			res.end('');
      			});
    		});
  		}));
	}

  // Declare the method that actually does the authentication
	strategy.authenticate= function(request, response, callback) {
		//todo: makw the call timeout ....
    	var parsedUrl= url.parse(request.url, true),
		self= this; 
		
    	if( parsedUrl.query && parsedUrl.query.code  ) {
      		oAuth.getOAuthAccessToken(
				parsedUrl.query && parsedUrl.query.code, 
				{redirect_uri: redirectUri}, 
				function( error, access_token, refresh_token ){
					if( error ) {
						callback(error)
					} else {
						request.session["access_token"]= access_token;
                        if( refresh_token ) request.session["refresh_token"] = refresh_token;
                        oAuth.getProtectedResource("https://graph.facebook.com/me", request.session["access_token"], function (error, data, response) {
                        	if( error ) {
								self.fail(callback);
                        	} else {
								parsedData = JSON.parse(data);
                          		self.success({
									strategyUserId: parsedData.id,
									strategyName: strategy.name,
									userName: parsedData.name,
									userId: strategy.name + idDelimiter + parsedData.id,
									email: data.email,
									strategyData: parsedData
								}, callback)
                        	}
						})
					}
				});
    		} else { 
       			request.session['facebook_redirect_url']= request.url;
       			var redirectUrl= oAuth.getAuthorizeUrl({redirect_uri : redirectUri, scope: scope })
       			self.redirect(response, redirectUrl, callback);
     		}
		}  
  
	return strategy;
};