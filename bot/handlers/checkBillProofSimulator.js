module.exports = function (session, next, data) {
  var potentialProofs = ['NoRecordFound','RTS','Disclaimed','TreatedAsSPAM'];  
  //session.dialogData[data.output] = potentialProofs[Math.floor(Math.random() * 4) + 1];
  session.dialogData[data.output] = potentialProofs[0];
  session.send(session.dialogData[data.output]);
  next();
}