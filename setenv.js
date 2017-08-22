const request = require('request');

function saveNumber(message){
  var finalEnlishToBanglaNumber={'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
  String.prototype.getDigitEnglishFromBangla = function() {
    var retStr = this;
    for (var x in finalEnlishToBanglaNumber) {
         retStr = retStr.replace(new RegExp(x, 'g'), finalEnlishToBanglaNumber[x]);
    }
      return retStr;
  };

  var convertedMsg = message.getDigitEnglishFromBangla()

  var re = /(\+88)?01\d+/g;
  var matchedNumber = convertedMsg.match(re);
  if (matchedNumber){
    matchedNumber = matchedNumber[0]
    console.log(matchedNumber)
    if(matchedNumber.length===11||matchedNumber.length===13||matchedNumber.length===14){
    
    var api = "http://mint.finder-lbs.com/api/v1/message"
    var data = {
      "name":"N/A",
      "phone": "matchedNumber",
      "message":"message", 
      "secret_key":"9799443B926A395298EEBF43D8DD5"
    }

    request({
      uri: api,
      method: 'POST',
      json: data

    }, function (error, response, body) {
      console.log("response.statusCode", response.statusCode)
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

var message = "This is a bangla number 01947962293"
saveNumber(message)
