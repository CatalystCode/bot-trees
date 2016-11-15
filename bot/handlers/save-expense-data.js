
module.exports = function (session, next) {
  session.dialogData.expense = {};
  session.send("expense data saved...");
  next();
}