/**
 * Class representing a tree structure of JSONPaths.
 */
class JSONPathsTree {
    /**
     * Create a JSONPathsTree.
     * @param {Set<string>} paths - The set of JSONPaths.
     */
    constructor(paths) {
        this.paths = paths;
        this.root = JSONPathsTree.#buildTreeFromJSONPaths(paths);
    }

    /**
     * Build a tree structure from JSONPaths.
     * @param {Set<string>} paths - The set of JSONPaths.
     * @returns {Object} - The root of the tree structure.
     * @private
     * @static
     */
    static #buildTreeFromJSONPaths(paths) {
        const markSiblings = node => {
            const keys = Object.keys(node.children);
            keys.forEach((key, index) => {
                node.children[key].isLastSibling = index === keys.length - 1;
                markSiblings(node.children[key]);
            });
        }
    
        const root = {
            children: {},
            isLastSibling: true,
            path: '$'
        };
    
        paths.forEach(path => {
            const segments = path.replace(/^\$./, '').split('.');
            let currentNode = root;
    
            segments.forEach((segment, index) => {
                if (!currentNode.children[segment]) {
                    currentNode.children[segment] = {
                        children: {},
                        isLastSibling: false,
                        path: `${currentNode.path}.${segment}`
                    };
                }
                currentNode = currentNode.children[segment];
            });
        });
    
        markSiblings(root);
        return root;
    }

    /**
     * Get all leaf nodes in the tree.
     * @returns {Array<Object>} - An array of leaf nodes.
     */
    getLeaves() {
        const traverse = (node, leaves) => {
            const keys = Object.keys(node.children);
            if (keys.length === 0) {
                leaves.push(node);
            } else {
                keys.forEach(key => {
                    traverse(node.children[key], leaves);
                });
            }
        };
    
        const leaves = [];
        traverse(this.root, leaves);
        return leaves;
    }

    /**
     * Get the tree structure as a string.
     * @returns {string} - The tree structure as a string.
     */
    toString() {
        const getNodeAsString = (node, indent = '') => {
            let result = '';
            const keys = Object.keys(node.children);
            keys.forEach((key, index) => {
                const childNode = node.children[key];
                const isLast = index === keys.length - 1;
                result += indent + (isLast ? '└── ' : '├── ') + key + '\n';
                result += getNodeAsString(childNode, indent + (isLast ? '    ' : '│   '));
            });
            return result;
        };
    
        return getNodeAsString(this.root);
    }
}

export default JSONPathsTree;