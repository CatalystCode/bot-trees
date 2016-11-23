
module.exports = function (session, next) {
  session.send("income data saved...");
  next();
}