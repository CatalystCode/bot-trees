module.exports = function (session, next) {
  session.send("Authentication Confirmed: Access Granted");
  next();
}