
module.exports = (session, next) => {
  session.send("income data saved...");
  return next();
}