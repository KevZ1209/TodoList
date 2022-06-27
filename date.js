

module.exports.getDate = getDate;

function getDate() {
  var today = new Date();
  var currentDay = today.getDay();
  var day = ""
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  day = days[currentDay];

  return day;
}


module.exports.function2 = anotherFunction;

function anotherFunction() {
  return 2;
}

// can use exports instead of module.exports
module.exports.function3 = function() {
  return 3;
}
