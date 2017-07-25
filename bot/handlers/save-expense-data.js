
module.exports = (session, next) => {
  session.dialogData.data.expense = {};
  session.send("expense data saved...");
  return next();
}