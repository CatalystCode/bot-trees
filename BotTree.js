var extend = require('extend');

var builder = require('botbuilder');
var conditionHandler = require('./conditionHandler');

function BotTree(opts) {
    if (!opts.tree) throw new Error('tree is required');
    
    var self = this;
    this.tree = opts.tree;
    this.steps = opts.steps || 100;

    normalizeTree(this.tree);

    function normalizeTree(tree) {
        var nodeIds = {};
        var uniqueNodeId = 1;
        recursive(null, tree);
        self._nodeIds = nodeIds;

        function initNodes(parent, nodes) {
          nodes = nodes || [];
          nodes.forEach(function(nodeItem, index) {

            // In case of extension, copy all extension to current node
            if (shouldExtend(nodeItem)) {
              var extension = tree.extensions[nodeItem.extensionId];
              extend(true, nodeItem, extension);
            }

            if (parent) nodeItem._parent = parent;
            if (index > 0) nodeItem._prev = nodes[index - 1];
            if (nodes.length > index + 1) nodeItem._next = nodes[index + 1];
            recursive(parent, nodeItem);
          }, this); 
        }

        function recursive(parent, node) {
          initNodes(parent, node.steps);

          var scenarios = node.scenarios || [];
          scenarios.forEach(function(scenario) {
            initNodes(node, scenario.steps);
          }, this);
          
          if (!node.id) { node.id = '_node_' + (uniqueNodeId++); } 
          nodeIds[node.id] = node;
        }

        function shouldExtend(nodeItem) {
            if (!nodeItem.extensionId) return false;

            var _parent = nodeItem.parent;
            while (_parent) {
                if (nodeItem.extensionId == _parent.extensionId) { 
                    throw new Error('recursive extension found ' + nodeItem.extensionId);
                }
                _parent = _parent.parent;
            }

            return true;
        }
    }
}

BotTree.prototype.getSteps = function() {
	var self = this;

  /**
   * session - bot session variable
   * tree - full json scenario template
   */
  function getNextNode(session) {
    var next = null;
    var current = self._nodeIds[session.dialogData._currentNodeId];

    // If there are child scenarios, see if one of them answers a condition
    // In case it is, choose the first step in that scenario to as the next step
    var scenarios = current.scenarios || [];
    for (var i=0; i<scenarios.length; i++) {
      var scenario = scenarios[i];
      if (conditionHandler.evaluateExpression(session, scenario.condition)) {
        next = (scenario.nodeId && self._nodeIds[scenario.nodeId]) || scenario.steps[0];
        break;
      }
    }

    // If there is no selected scenario, move to the next node.
    // If there is no next node, look recursively for next on parent nodes.
    var _node = current;
    while (!next && _node) {
      next = _node._next;
      _node = _node._parent;
    }

    return next;
  }

function getCurrentNode(session) {
  return self._nodeIds[session.dialogData._currentNodeId];
}
  
function performAcion(session, next) {

  var currentNode = getCurrentNode(session);
  
  switch (currentNode.type) {

    case 'text':
      session.send(currentNode.data.text);
      return next();

    case 'prompt':
      var promptType = currentNode.data.type || 'text';
      builder.Prompts[promptType](session, currentNode.data.text, currentNode.data.options);
      return;
    
    case 'handler':
      var handlerName = currentNode.data.name;
      var handler = require('./handlers/' + handlerName);
      return handler(session, next);
  
    default:
      var error = new Error('Node type ' + currentNode.type + ' is not recognized');
      console.error(error);
      throw error; 
  }  
}

  function collectResponse(session, results) {

    var currentNode = getCurrentNode(session);
    var varname = currentNode.varname || currentNode.id;
    
    if (!(results.response && varname)) return;

    session.dialogData[varname] = results.response;

    if (currentNode.type === 'prompt') {
      if (currentNode.data.type === 'time') {
        session.dialogData[varname] = builder.EntityRecognizer.resolveTime([results.response]);
      }
      if (currentNode.data.type === 'choice') {
        session.dialogData[varname] = currentNode.data.options[results.response.entity];
      }
      console.log("new session variable %s with value %s", varname, session.dialogData[varname]);
    }
  }


  function stepInteractionHandler(session, results, next) {
    if (!session.dialogData._currentNodeId) { 
      session.dialogData._currentNodeId = self.tree.steps[0].id;
    }
    var currentNode = self._nodeIds[session.dialogData._currentNodeId];
    
    // processing
    console.log('stepHandler: ', currentNode.id);

    performAcion(session, next);
  }

  function stepResultCollectionHandler(session, results, next) {
    collectResponse(session, results);
    return next();
  }

  function setNextStepHandler(session, args, next) {

    var nextNode = getNextNode(session);
    if (nextNode) 
      session.dialogData._currentNodeId = nextNode.id;
    else
      return session.endDialog();

    return next();
  }

	var steps = [];

  function clearSession(session, results, next) {
    if (session.dialogData._currentNodeId) { 
      session.reset();
    }
    return next();
  }

  steps.push(clearSession);


	for (var i=0; i<self.steps; i++) {
    steps.push(stepInteractionHandler);
    steps.push(stepResultCollectionHandler);
    steps.push(setNextStepHandler);
  }

	return steps;
}

module.exports = BotTree;
