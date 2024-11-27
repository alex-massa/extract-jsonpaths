#!/usr/bin/env node

const { createRequire } = require('node:module');
require = createRequire(__filename);

const fs = require('fs');
const { promisify } = require('util');
const { Command } = require('commander');
const { version } = require('./package.json');
const { getJSONPathsFromSchema, getJSONPathsFromObject } = require('./utils/json-paths-utils.js');
const JSONPathsTree = require('./lib/json-paths-tree.js').default;

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

    const json = JSON.parse(input);
    const jsonPaths = options.fromSchema
        ? await getJSONPathsFromSchema(json, options.leaves)
        : await getJSONPathsFromObject(json, options.leaves);
    if (!Boolean(jsonPaths?.size)) {
        return;
    }
    handler(jsonPaths, options);
}

function handleExtract(jsonPaths, options) {
    const paths = [...jsonPaths];
    console.log(options.json ? JSON.stringify(paths) : paths.join('\n'));
}

function handleTree(jsonPaths, options) {
    const jsonPathsTree = new JSONPathsTree(jsonPaths);
    console.log(jsonPathsTree.toString());
}

program
    .name('extract-jsonpaths')
    .description('CLI tool to extract JSONPath(s) from a JSON object or JSON Schema.')
    .version(version);

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
