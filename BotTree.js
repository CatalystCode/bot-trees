
function BotTree(opts) {
    if (!opts.tree) throw new Error('tree is required');
    
    var self = this;
    this.tree = opts.tree;

    normalizeTree(this.tree);

    function normalizeTree(tree) {
        var nodeIds = {};
        recursive(null, tree);
        this._nodeIds = nodeIds;

        function initNodes(parent, nodes) {
            nodes = nodes || [];
            nodes.forEach(function(nodeItem, index) {
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
    }
}


module.exports = BotTree;
