
function BotTree(opts) {
    if (!opts.tree) throw new Error('tree is required');
    
    var self = this;
    this.tree = opts.tree;

    normalizeTree(this.tree);

    function normalizeTree(tree) {
        var nodeIds = {};
        recursive(tree);
        this._nodeIds = nodeIds;

        function recursive(node) {
            if (node.steps && node.steps.length > 0)
                node.steps.forEach(function(nodeItem, index) {
                    recursive(nodeItem);
                }, this); 
            if (node.scenarios && node.scenarios.length > 0)
                node.scenarios.forEach(function(nodeItem, index) {
                    recursive(nodeItem);
                }, this); 

            if (node.id) nodeIds[node.id] = node;
        }
    }
}


module.exports = BotTree;
