//require the Twilio module and create a REST client
var twilio = require('twilio')('ACb9397bdbf18fc0d8168b04ea39649f8b', 'ee5646a4f115f917eb03d25783cf8ef8');
var Promise = require('promise');
// https://www.npmjs.com/package/request
var needle = require('needle');

function sendMessage(msgTo, msgFrom, msgBody, cb) {
    //Send an SMS text message
    twilio.sendMessage({

        to: msgTo, // Any number Twilio can deliver to
        from: msgFrom, // A number you bought from Twilio and can use for outbound communication
        body: msgBody // body of the SMS message

    }, function(err, responseData) { //this function is executed when a response is received from Twilio

        if (!err) { // "err" is an error received during the request, if any

            // "responseData" is a JavaScript object containing data received from Twilio.
            // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
            // http://www.twilio.com/docs/api/rest/sending-sms#example-1

            console.log(responseData.from); // outputs "+441403540126"
            console.log(responseData.body); // outputs "word to your mother."
            cb({success: true});
        } else {
            cb(err);
        }
    });
}

//inserting message to CE
function insertSentence(sentence, url) {
        var promise = new Promise(function (resolve, reject) {
            var options = {
                headers: {
                    "Content-type": "text/plain; charset=UTF-8"
                }
            };
            needle.post(url,
                sentence,
                options,
                function (err, resp) {
                    if (err) {
                        console.log ("ERROR with inserting sentence to CE");
                        reject(err);
                    } else {
                        console.log ("SUCCESS with inserting sentence to CE");
                        resolve(resp.body);
                    }
                });
        });
        return promise;
    }


module.exports = {
    sendMessage: sendMessage,
    insertSentence: insertSentence
    //receiveMessage: receiveMessage
}
