import fs from 'fs';
import getStdin from 'get-stdin';
import { promisify } from 'util';
import { Command } from 'commander';
import { getJSONPathsFromSchema, getJSONPathsFromObject } from './utils/json-paths-utils.js';
import JSONPathsTree from './lib/json-paths-tree.js';
import $RefParser from '@apidevtools/json-schema-ref-parser';

let fromSchema = false;

const program = new Command();

async function handleCommand(inputFile, options, handler) {
    const input = inputFile
        ? await promisify(fs.readFile)(inputFile, 'utf8')
        : await getStdin();
    if (!input) {
        throw new Error("No input provided via file or stdin.");
    }

    let jsonPaths;
    if (fromSchema) {
        const jsonSchema = JSON.parse(input);
        const resolvedJsonSchema = await $RefParser.dereference(jsonSchema, { mutateInputSchema: false });
        jsonPaths = resolvedJsonSchema.properties ? getJSONPathsFromSchema(resolvedJsonSchema.properties) : new Set();
    } else {
        const jsonObject = JSON.parse(input);
        jsonPaths = getJSONPathsFromObject(jsonObject);
    }

    handler(jsonPaths, options);
}

function handleExtract(jsonPaths, options) {
    let paths;

    if (options.leaves) {
        const jsonPathsTree = new JSONPathsTree(jsonPaths);
        paths = jsonPathsTree.getLeaves().map(node => node.path);
    } else {
        paths = [...jsonPaths];
    }

    if (options.json) {
        console.log(JSON.stringify(paths));
    } else {
        paths.forEach(path => console.log(path));
    }
}

function handleTree(jsonPaths, options) {
    const jsonPathsTree = new JSONPathsTree(jsonPaths);
    console.log(jsonPathsTree.toString());
}

program
    .description('CLI tool to extract JSONPath(s) from a JSON object.')
    .option('-s, --from-schema', 'extract JSONPath(s) from the properties of a JSON Schema instead of a JSON object')
    .on('option:from-schema', () => fromSchema = true);

program
    .command('extract [input]', { isDefault: true })
    .description('output JSONPath(s)')
    .option('-l, --leaves', 'output only leaf nodes') 
    .option('-j, --json', 'output as JSON array')
    .action((inputFile, options) => handleCommand(inputFile, options, handleExtract));

program
    .command('tree [input]')
    .description('output a tree representation of JSONPath(s)')
    .action((inputFile, options) => handleCommand(inputFile, options, handleTree));

program.parse(process.argv);
