import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(process.cwd(), 'extract-jsonpaths.js');

const runTest = (subcommand, inputFile, expectedFile, args = []) => {
    const inputPath = path.resolve(__dirname, `fixtures/${inputFile}`);
    const expectedOutputPath = path.resolve(__dirname, `expected/${expectedFile}`);
    const output = spawnSync(
        'node', [cliPath, subcommand, inputPath, ...args],
        { encoding: 'utf8' }
    ).stdout.trim();
    const expectedOutput = fs.readFileSync(expectedOutputPath, 'utf8').trim();
    expect(output).to.equal(expectedOutput);
};

describe('JSONPath Extraction', () => {
    it('extracts JSONPaths from a JSON object', () => {
        runTest('extract', 'object.json', 'object-paths.txt');
    });

    it('extracts JSONPaths from the properties section of a JSON schema', () => {
        runTest('extract', 'schema.json', 'schema-paths.txt', ['--from-schema']);
    });

    it('extracts only the leaves JSONPaths from a JSON object', () => {
        runTest('extract', 'object.json', 'object-leaves.txt', ['--leaves']);
    });

    it('extracts only the leaves JSONPaths from the properties section of a JSON schema', () => {
        runTest('extract', 'schema.json', 'schema-leaves.txt', ['--from-schema', '--leaves']);
    });

    it('extracts JSONPaths from a JSON object and outputs as JSON list', () => {
        runTest('extract', 'object.json', 'object-paths.json', ['--json']);
    });

    it('extracts JSONPaths from the properties section of a JSON schema and outputs as JSON list', () => {
        runTest('extract', 'schema.json', 'schema-paths.json', ['--from-schema', '--json']);
    });

    it('extracts only the leaves JSONPaths from a JSON object and outputs as JSON list', () => {
        runTest('extract', 'object.json', 'object-leaves.json', ['--leaves', '--json']);
    });

    it('extracts only the leaves JSONPaths from the properties section of a JSON schema and outputs as JSON list', () => {
        runTest('extract', 'schema.json', 'schema-leaves.json', ['--from-schema', '--leaves', '--json']);
    });
});

describe('JSONPath Tree Output', () => {
    it('outputs a tree representation of a JSON object', () => {
        runTest('tree', 'object.json', 'object-tree.txt');
    });

    it('outputs a tree representation of the properties section of a JSON schema', () => {
        runTest('tree', 'schema.json', 'schema-tree.txt', ['--from-schema']);
    });
});
