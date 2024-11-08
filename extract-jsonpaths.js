import fs from 'fs';
import getStdin from 'get-stdin';
import { promisify } from 'util';
import { getJSONPathsFromSchema, getJSONPathsFromObject } from './utils/json-paths-utils.js';
import JSONPathsTree from './lib/json-paths-tree.js';
import $RefParser from '@apidevtools/json-schema-ref-parser';

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

main().catch(err => {
    console.error(err);
    process.exit(1);
});
