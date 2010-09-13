/*!
 * Copyright(c) 2010 Ciaran Jessup <ciaranj@gmail.com>
 * MIT Licensed
 */
module.exports= function(options) {
    options= options || {};
    var strategy = {
        name: options.name || "anon"
    },
    idDelimiter = options.idDelimiter || ":",
    nextId = options.nextIdFunction(),
    anonUser = options.anonymousUser || {
        strategyName: strategy.name,
        strategyUserId: nextId,
        userId: strategy.name + idDelimiter + nextId,
        userName: "Anonymous"
    };
      
    strategy.authenticate= function(request, response, callback) {
        this.success( anonUser, callback );
    }

    return strategy;

};
