var jsep = require('jsep');

/**
 * parseExpression
 * ===============
 * return true/false based on the expression
 * can use numbers, session variables, and comparrison operators
 * Example 1: if (parseExpression(session, 'days > 7')) {...}
 * Example 2: if (parseExpression(session, 'age - years > 20')) {...}
 */
function evaluateExpression(session, expression) {

  var exp = expression;
  if (typeof exp == 'string') {
    exp = jsep(exp);
  }

  switch (exp.type) {
    case 'BinaryExpression':
      var value1 = parseExpression(session, exp.left);
      var value2 = parseExpression(session, exp.right);
      return calculateExpression(exp.operator, value1, value2);

    case 'UnaryExpression':
      var value = parseExpression(session, exp.argument);
      return calculateExpression(exp.operator, value1);

    case 'Identifier':
      return session[exp.name];

    case 'Literal':
      return exp.value;

    default:
      throw new Error('condition type ' + exp.type + ' is not recognized');
  }
}

function calculateExpression(operator, value1, value2) {
  switch (operator) {

    case '!':
      return !value1;

    case '<':
      return value1 < value2;

    case '>':
      return value1 > value2;

    case '<=':
      return value1 <= value2;

    case '>=':
      return value1 >= value2;

    case '=':
    case '==':
      return value1 == value2;

    case '===':
      return value1 === value2;

    case '!=':
    case '<>':
      return value1 != value2;
  
    case '!==':
      return value1 !== value2;

    case '-':
      return value1 - value2;

    case '+':
      return value1 + value2;

    case '*':
      return value1 * value2;

    case '/':
      return value1 / value2;

    case '%':
      return value1 % value2;

    default:
      break;
  }
}

module.exports = {
  evaluateExpression: evaluateExpression
};