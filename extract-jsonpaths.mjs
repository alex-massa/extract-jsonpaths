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
      paths = [...jsonPaths].filter(path => ![...jsonPaths].some(otherPath => otherPath.startsWith(`${path}.`) && otherPath !== path));
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
  else if (treeCommand) {
    console.log(getTreeAsString(jsonPaths));
    return;
  }
  else {
    throw new Error("No command specified. Please provide either --extract or --tree.");
  }
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
 * Builds a tree structure from a list of JSONPaths
 * @param {Set<string>} paths - The set of JSONPaths
 * @returns {object} The tree structure
 */
function buildTreeFromJSONPaths(paths) {
  function markSiblings(node) {
    const keys = Object.keys(node);
    keys.forEach((key, index) => {
        node[key].isLastSibling = index === keys.length - 1;
        markSiblings(node[key].children);
    });
  }

  const root = {};
  paths.forEach(path => {
    const segments = path.replace(/^\$./, '').split('.');
    let currentNode = root;

    segments.forEach((segment, index) => {
      if (!currentNode[segment]) {
          currentNode[segment] = { children: {}, isLastSibling: false };
      }
      if (index === segments.length - 1) {
          currentNode[segment].isLeaf = true;
      }
      currentNode = currentNode[segment].children;
    });
  });
  markSiblings(root);
  return root;
}

/**
 * Outputs a tree structure as a string
 * @param {Set<string>} paths - The set of JSONPaths
 * @returns {string} - The tree structure as a string
 */
function getTreeAsString(paths) {
  function getNodeAsString(node, indent = '') {
    const keys = Object.keys(node);
    let result = '';
    keys.forEach((key, index) => {
      const isLast = node[key].isLastSibling;
      const newIndent = indent + (isLast ? '└── ' : '├── ');
      result += newIndent + key + '\n';
      result += getNodeAsString(node[key].children, indent + (isLast ? '    ' : '│   '));
    });
    return result;
  }

  const root = buildTreeFromJSONPaths(paths);
  return getNodeAsString(root);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
