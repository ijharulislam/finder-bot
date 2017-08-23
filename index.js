'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
var messengerButton = "<html><head><title>Facebook Messenger Bot</title></head><body><h1>Finder Facebook Bot</h1></body></html>";

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }
});


app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(messengerButton);
  res.end();
});

app.post('/webhook', function (req, res) {
  console.log(req.body);
  var data = req.body;

  if (data.object === 'page') {

    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else if (event.postback) {
          receivedPostback(event);   
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });
    res.sendStatus(200);
  }
});


function getUserInfo(senderId){
  request('https://graph.facebook.com/v2.6/'+senderId+'?access_token='+process.env.PAGE_ACCESS_TOKEN, function (error, response, body) {
    console.log('Profile body:', body);
    return body
  });
}


function saveNumber(message, senderId){
  var finalEnlishToBanglaNumber={'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
  String.prototype.getDigitEnglishFromBangla = function() {
    var retStr = this;
    for (var x in finalEnlishToBanglaNumber) {
         retStr = retStr.replace(new RegExp(x, 'g'), finalEnlishToBanglaNumber[x]);
    }
      return retStr;
  };

  var convertedMsg = message.getDigitEnglishFromBangla()

  var re = /(\+88)?01\d+(-| )?\d+/g;
  var matchedNumber = convertedMsg.match(re);
  if (matchedNumber){
    
    var profile = getUserInfo(senderId)
    console.log(profile)

    matchedNumber = matchedNumber[0]
    console.log(matchedNumber)
    if(matchedNumber.length===11||matchedNumber.length===13||matchedNumber.length===14||matchedNumber.length===12||matchedNumber.length===15){
    
    var api = "http://mint.finder-lbs.com/api/v1/message"
    var data = {
      "name":"N/A",
      "phone": matchedNumber,
      "message": message,
      "secret_key": "9799443B926A395298EEBF43D8DD5"
    }

    request({
      uri: api,
      method: 'POST',
      json: data

    }, function (error, response, body) {
      if (!error && response.statusCode == 201) {

        console.log("Successfully saved number");
      } else {
        console.error("Unable to saved message.");
        // console.error(response);
        console.error(error);
      }
    }
    )
      return matchedNumber
    }
  }
  return;
}


function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message: %d", 
    senderID, recipientID, timeOfMessage, event.sender);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageAttachments = message.attachments;

  var message_number = saveNumber(messageText, senderID)

  if(message_number){
    sendGenericMessage(senderID)
  }

  // if (messageText) {
  //   switch (messageText) {
  //     case 'generic':
  //       sendGenericMessage(senderID);
  //       break;

  //     default:
  //       sendTextMessage(senderID, messageText);
  //   }
  // } else if (messageAttachments) {
  //   sendTextMessage(senderID, "Message with attachment received");
  // }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);
  sendTextMessage(senderID, "Postback called");
}

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "ধন্যবাদ, আমরা দ্রুত যোগাযোগ করব। চাইলে আপনি এখনই নিচের ফর্মটি পূরণ করতে পারেন",
              subtitle: "Finder GPS Tracking",
              item_url: "https://goo.gl/M4vNRp"
            }
          ]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});