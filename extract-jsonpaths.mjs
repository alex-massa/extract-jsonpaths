import fs from "fs";
import { promisify } from "util";
import $RefParser from "@apidevtools/json-schema-ref-parser";
import getStdin from 'get-stdin';

// check for flags
const args = process.argv.slice(2);

const inputFile = args.find(arg => !arg.startsWith('-'));

const schemaOption = args.includes('--from-schema') || args.includes('-s');

const extractCommand = args.includes('--extract');
const leavesOption = args.includes('--leaves') || args.includes('-l');
const jsonOption = args.includes('--json') || args.includes('-j');

const treeCommand = args.includes('--tree');

// load schema and resolve references
async function main() {
    const input = await (async (inputFile) =>
        inputFile ? promisify(fs.readFile)(inputFile, 'utf8') : getStdin()
    )(inputFile);
    if (!input) {
        throw new Error("No input provided via file or stdin.");
    }

    let jsonPaths;
    if (schemaOption) {
        const jsonSchema = JSON.parse(input);
        const resolvedJsonSchema = await $RefParser.dereference(jsonSchema, { mutateInputSchema: false });
        // get JSONPaths starting from the properties section
        jsonPaths = resolvedJsonSchema.properties ? getJSONPathsFromSchema(resolvedJsonSchema.properties) : new Set();
    }
    else {
        const jsonObject = JSON.parse(input);
        jsonPaths = getJSONPathsFromObject(jsonObject);
    }

    if (extractCommand) {
        let paths;
        if (leavesOption) {
            const jsonPathsTree = new JSONPathsTree(jsonPaths);
            paths = jsonPathsTree.getLeaves().map(node => node.path);
        } else {
            paths = [...jsonPaths];
        }

        if (jsonOption) {
            console.log(JSON.stringify(paths));
        } else {
            [...paths].forEach(path => console.log(path));
        };
        return;
    }
    if (treeCommand) {
        const jsonPathsTree = new JSONPathsTree(jsonPaths);
        console.log(jsonPathsTree.toString());
        return;
    }
    throw new Error("No command specified. Please provide either --extract or --tree.");
}

/**
 * Recursive function to get all JSONPaths from a JSON object
 * @param {object} obj - The JSON object
 * @param {string} [path=$] - The current JSONPath
 * @param {Set<string>} [paths=new Set()] - The set of JSONPaths
 * @returns {Set<string>} The set of JSONPaths
 */
function getJSONPathsFromObject(obj, path = "$", paths = new Set()) {
    if (obj && typeof obj === "object" && obj !== null) {
        for (const key in obj) {
            const currentPath = `${path}.${key}`;
            if (Array.isArray(obj[key])) {
                // for arrays, add the path with [*] notation
                const arrayPath = `${currentPath}[*]`;
                paths.add(arrayPath);
                obj[key].forEach(item => {
                    getJSONPathsFromObject(item, arrayPath, paths);
                });
            } else if (typeof obj[key] === "object" && obj[key] !== null) {
                // for nested objects, add the path and recurse
                paths.add(currentPath);
                getJSONPathsFromObject(obj[key], currentPath, paths);
            } else {
                // for primitive values, just add the path
                paths.add(currentPath);
            }
        }
    }
    return paths;
}

/**
 * Recursive function to get all JSONPaths from a JSONSchema within $.properties
 * @param {object} obj - The JSONSchema object
 * @param {string} [path=$] - The current JSONPath
 * @param {Set<string>} [paths=new Set()] - The set of JSONPaths
 * @returns {Set<string>} The set of JSONPaths
 */
function getJSONPathsFromSchema(obj, path = "$", paths = new Set()) {
    if (obj && typeof obj === "object" && obj !== null) {
        for (const key in obj) {
            const currentPath = `${path}.${key}`;
            // check if the current key is an array
            if (obj[key].type === "array" && obj[key].items) {
                const arrayPath = `${currentPath}[*]`;
                // add the array path only if it doesn't exist
                paths.add(arrayPath);
                // recursively get properties of the items
                getJSONPathsFromSchema(obj[key].items.properties, arrayPath, paths);
            } else {
                // add the current path if it's not already included
                paths.add(currentPath);
                // check for properties or items of non-array objects
                getJSONPathsFromSchema(obj[key].properties || obj[key].items?.properties, currentPath, paths);
            }
        }
    }
    return paths;
}

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

main().catch(err => {
    console.error(err);
    process.exit(1);
});
