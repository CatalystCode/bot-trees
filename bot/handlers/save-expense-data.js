
module.exports = function (session, next) {
  session.dialogData.data.expense = {};
  session.send("expense data saved...");
  next();
}