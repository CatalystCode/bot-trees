module.exports = function (session, next, data) {
  session.dialogData[data.output] =  Math.random() < 0.5 ? true : false;
  session.send();
  next();
}