module.exports = function (session, next, data) {
  //Used a placeholder to Amdocs backend logic
  session.send("Placeholder Handler Response: " + data.text);
  next();
}