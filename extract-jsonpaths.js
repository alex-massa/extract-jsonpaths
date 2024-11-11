const { createRequire } = require('node:module');
require = createRequire(__filename);

const fs = require('fs');
const { promisify } = require('util');
const { Command } = require('commander');
const { getJSONPathsFromSchema, getJSONPathsFromObject } = require('./utils/json-paths-utils.js');
const JSONPathsTree = require('./lib/json-paths-tree.js').default;
const $RefParser = require('@apidevtools/json-schema-ref-parser');

const program = new Command();

async function handleCommand(inputFile, options, handler) {
    const getStdin = (await import('get-stdin')).default;
    const input = inputFile
        ? await promisify(fs.readFile)(inputFile, 'utf8')
        : await getStdin();
    if (!input) {
        console.error("Error: No input provided via file or stdin.");
        program.outputHelp();
        process.exit(1);
    }

    let jsonPaths;
    if (options.fromSchema) {
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

program
    .command('extract [input]', { isDefault: true })
    .description('output JSONPath(s)')
    .option('-s, --from-schema', 'extract JSONPath(s) from the properties of a JSON Schema instead of a JSON object')
    .option('-l, --leaves', 'output only leaf nodes') 
    .option('-j, --json', 'output as JSON array')
    .action((inputFile, options) => handleCommand(inputFile, options, handleExtract));

program
    .command('tree [input]')
    .option('-s, --from-schema', 'extract JSONPath(s) from the properties of a JSON Schema instead of a JSON object')
    .description('output a tree representation of JSONPath(s)')
    .action((inputFile, options) => handleCommand(inputFile, options, handleTree));

program.parse(process.argv);
