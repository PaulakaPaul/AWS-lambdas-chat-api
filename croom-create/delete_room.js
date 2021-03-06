var RedisSMQ = require("rsmq");
var settings = require('./common/settings')
var f = require('./common/functions')
var f_user_in_chat = require('./common/user_in_chat_common')

exports.handler = function(e, ctx, callback) {
    
    let rsmq = new RedisSMQ(settings.REDIS_OPTIONS)
    let listener = e.listener;
    let user = e.user;

    if(f.isAnyNullOrEmpty(listener, user)) {
        callback(null, f.createResponse('',"There are no listener or user passed as parameters", '', 400));
        rsmq.quit();
    } else {
        let cr_namespace = `${settings.CHAT_ROOM_NAMESPACE}-${listener}`; 
        let cr_queue_namespace = `${cr_namespace}-${user}`; // Per user chat queue.
            
        rsmq.deleteQueue( {qname: cr_queue_namespace}, function (err, resp) {
            if(err) {
                callback(null, f.createResponse('', err.message, '', 500));
            } else {
                // This functions also handles the callbacks.
                f_user_in_chat.add_flag(callback, settings.FALSE, user, 
                    `Queue ${cr_queue_namespace} was deleted.`);
            } 
            rsmq.quit();
        });
    }
}