import fs from "fs";
import { promisify } from "util";
import $RefParser from "@apidevtools/json-schema-ref-parser";
import getStdin from 'get-stdin';

const readFile = promisify(fs.readFile);

// check for flags
const args = process.argv.slice(2);
const schemaFile = args.find(arg => !arg.startsWith('-'));
const treeFlag = args.includes('--tree') || args.includes('-t');
const leavesFlag = args.includes('--leaves') || args.includes('-l');
const jsonFlag = args.includes('--json') || args.includes('-j');
const schemaFlag = args.includes('--from-schema') || args.includes('-s');

// load schema and resolve references
async function main() {
  const input = await (async () => {
    if (schemaFile) {
      return readFile(schemaFile, 'utf8');
    } else {
      return getStdin();
    }
  })();
  if (!input) {
    throw new Error("No input provided. Please provide a JSON schema file or standard input.");
  }

  let jsonPaths;
  if (schemaFlag) {
    const schema = JSON.parse(input);
    const resolvedSchema = await $RefParser.dereference(schema, { mutateInputSchema: false });
    // get JSONPaths starting from the properties section
    jsonPaths = resolvedSchema.properties ? getJSONPathsFromSchema(resolvedSchema.properties) : new Set();
  }
  else {
    const object = JSON.parse(input);
    jsonPaths = getJSONPathsFromObject(object);
  }

  const jsonPathsTree = buildTreeFromJSONPaths(jsonPaths);
  if (treeFlag) {
    printAsTree(jsonPaths);
    return;
  };

  let paths;
  if (leavesFlag) {
    paths = [...jsonPaths].filter(path => ![...jsonPaths].some(otherPath => otherPath.startsWith(`${path}.`) && otherPath !== path));
  } else {
    paths = [...jsonPaths];
  }

  if (jsonFlag) {
    console.log(JSON.stringify(paths));
  } else {
    [...paths].forEach(path => console.log(path));
  };
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

// function to get all JSONPaths from a JSONSchema within $.properties
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

// function to get all JSONPaths from a JSON object
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

function buildTreeFromJSONPaths(paths) {
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

  function markSiblings(node) {
    const keys = Object.keys(node);
    keys.forEach((key, index) => {
        node[key].isLastSibling = index === keys.length - 1;
        markSiblings(node[key].children);
    });
  }

  markSiblings(root);
  return root;
}

function getLeaves(paths) {
  const root = buildTreeFromJSONPaths(paths);
  const leaves = [];

  function collectLeafNodes(node, path = '') {
    const keys = Object.keys(node);
    keys.forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      if (node[key].isLeaf) {
        leaves.push(currentPath);
      }
      collectLeafNodes(node[key].children, currentPath);
    });
  }

  collectLeafNodes(root);
  return leaves;
}

function printAsTree(paths) {
  const root = buildTreeFromJSONPaths(paths);

  function printNode(node, indent = '') {
    const keys = Object.keys(node);
    keys.forEach((key, index) => {
      const isLast = node[key].isLastSibling;
      const newIndent = indent + (isLast ? '└── ' : '├── ');
      console.log(newIndent + key);
      printNode(node[key].children, indent + (isLast ? '    ' : '│   '));
    });
  }

  printNode(root);
}