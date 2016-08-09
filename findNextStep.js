var conditionHandler = require('./conditionHandler');

/**
 * session - bot session variable
 * tree - full json scenario template
 */
module.exports = function findNextStep(session, tree) {
  var next = null;
  var current = tree._nodeIds[session.currentNodeId];

  // If there are child scenarios, see if one of them answers a condition
  // In case it is, choose the first step in that scenario to as the next step
  if (current.scenarios) {
    for (var scenarioIndex in current.scenarios) {

      var scenario = current.scenarios[scenarioIndex];
      if (conditionHandler.evaluateExpression(session, scenario.condition)) {

        next = (scenario.nodeId && tree._nodesIds[scenario.nodeId]) || scenario.steps[0];
        break;
      }
    }
  }

  // If there is no selected scenario
  var _node = current;
  while (!next && _node) {
    next = _node.next;
    _node = _node.parent;
  }

  return next;
}