
function BotTree(opts) {
    if (!opts.tree) throw new Error('tree is required');
    
    var self = this;
    this.tree = opts.tree;
    this.steps = opts.steps || 100;

    normalizeTree(this.tree);

    function normalizeTree(tree) {
        var nodeIds = {};
        recursive(null, tree);
        self._nodeIds = nodeIds;

        function initNodes(parent, nodes) {
            nodes = nodes || [];
            nodes.forEach(function(nodeItem, index) {
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
            
            if (node.id) nodeIds[node.id] = node;
        }
    }
}

BotTree.prototype.findNextStep = function(session, tree) {
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

BotTree.prototype.getSteps = function() {
    var self = this;


    function stepHandler(session, args, a, b) {
        console.log('stepHandler: ');
        session.send('text ...!');
    }

    var steps = [];
    for (var i=0; i<self.steps; i++) steps.push(stepHandler);
    return steps;
}

module.exports = BotTree;
