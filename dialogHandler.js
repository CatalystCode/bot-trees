var conditionHandler = require('./conditionHandler');

/**
 * session - bot session variable
 * tree - full json scenario template
 */
function findNextStep(session, tree) {
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

  // If there is no selected scenario, move to the next node.
  // If there is no next node, look recursively for next on parent nodes.
  var _node = current;
  while (!next && _node) {
    next = _node.next;
    _node = _node.parent;
  }

  return next;
}

function getCurrentStep(session, tree) {
  var currentStepId = session.dialogData.__currentStep;
  var _node = tree._nodesIds[currentStepId];

  return _node;
}

function performAcion(session, tree, builder) {

  var currentNode = getCurrentStep(session, tree);
  
  switch (currentNode.type) {
    case 'prompt':
      var promptType = currentNode.data.type || 'text';
      builder.Prompts[promptType](session, currentNode.data.text, currentNode.data.options);
      break;
  
    default:
      break;
  }  
}

function collectResponse(session, tree, builder, results) {

  var currentNode = getCurrentStep(session, tree);
  var varname = currentNode.varname || currentNode.id;
  if (results.response && varname) {

    session.dialogData[varname] = results.response;

    if (currentNode.type == 'prompt') {
      if (currentNode.data.type == 'time') {
        session.dialogData[varname] = builder.EntityRecognizer.resolveTime([results.response]);
      }
      if (currentNode.data.type == 'choice') {
        session.dialogData[varname] = currentNode.data.options[results.response.entity];
      }
      
    }
    switch (currentNode.varType) {
      case 'time':
        break;
    
      default:
        break;
    }
  }
}

module.exports = {
  findNextStep: findNextStep,
  getCurrentStep: getCurrentStep
} 