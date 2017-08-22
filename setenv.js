
function getNumber(message){
  var finalEnlishToBanglaNumber={'০':'0','১':'1','২':'2','৩':'3','৪':'4','৫':'5','৬':'6','৭':'7','৮':'8','৯':'9'};
  String.prototype.getDigitEnglishFromBangla = function() {
    var retStr = this;
    for (var x in finalEnlishToBanglaNumber) {
         retStr = retStr.replace(new RegExp(x, 'g'), finalEnlishToBanglaNumber[x]);
    }
      return retStr;
  };

  convertedMsg = message.getDigitEnglishFromBangla()

  var re = /(\+88)?01\d+/g;
  var matchedNumber = convertedMsg.match(re);
  if (matchedNumber){
		matchedNumber = matchedNumber[0]
		console.log(matchedNumber)
		if(matchedNumber.length===11||matchedNumber.length===13||matchedNumber.length===14){
		return matchedNumber
		}
  }
  return;
}
var message = "আমার সোনার 01947962293 বানগলা"
getNumber(message)