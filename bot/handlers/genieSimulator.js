module.exports = function (session, next, data) {
  //flips a virtual coin and returns the result
  if (data.result != null){
    session.dialogData[data.output] = data.result;    
  }
  else{
    session.dialogData[data.output] = Math.random() < 0.5 ? true : false;
  }
  session.send();
  next();
}