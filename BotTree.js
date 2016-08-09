var extend = require('extend');

var conditionHandler = require('./conditionHandler');

function BotTree(opts) {
    if (!opts.tree) throw new Error('tree is required');
    
    var self = this;
    this.tree = opts.tree;
    this.steps = opts.steps || 100;

    normalizeTree(this.tree);

    function normalizeTree(tree) {
        var nodeIds = {};
        var extensions = null;
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

        var uniqueNodeId = 1;
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


	function stepHandler(session, args, next) {
      if (!session.dialogData._currentNodeId) { 
        session.dialogData._currentNodeId = self.tree.steps[0].id;
      }
      var currentNode = self._nodeIds[session.dialogData._currentNodeId];
      
      // processing
      console.log('stepHandler: ', currentNode.id);
      session.send('_currentNodeId: ' + currentNode.id);
      // end processing

      var nextNode = getNextNode(session);
      if (nextNode) 
        session.dialogData._currentNodeId = nextNode.id;
      else
        return session.endDialog();

			return next();
	}

	var steps = [];
	for (var i=0; i<self.steps; i++) steps.push(stepHandler);
	return steps;
}

module.exports = BotTree;
