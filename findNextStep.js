var conditionHandler = require('./conditionHandler');

/**
 * session - bot session variable
 * tree - full json scenario template
 * current - pointer to current node in the scenario tree
 */
module.exports = function findNextStep(session, tree, current) {
  var next = null;

  // If there are child scenarios, see if one of them answers a condition
  // In case it is, choose the first step in that scenario to as the next step
  if (current.scenarios) {
    for (var scenarioIndex in current.scenarios) {

      var scenario = current.scenarios[scenarioIndex];
      if (conditionHandler.evaluateExpression(session, scenario.condition)) {

        next = (scenario.nodeId && tree.nodesIds[scenario.nodeId]) || scenario.steps[0];
        break;
      }
    }
  }

  // If there is no selected scenario
  if (!next) {
    if (current.next) {
      next = current.next;
    } 
    
    else if (current.parent && current.parent.next) {
      next = current.parent.next;
    }
  }

  return next;
}