
module.exports = function (session, results, next) {
  var summary = "Summary: ";
  for (var prop in session.dialogData) {
    summary += prop + ': [' + session.dialogData[prop] + ']; '; 
  }
  session.send(summary);
  next();
}