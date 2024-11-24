import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { fileURLToPath } from 'url';
import { getJSONPathsFromObject, getJSONPathsFromSchema } from '../utils/json-paths-utils.js';
import JSONPathsTree from '../lib/json-paths-tree.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('JSONPathsTree', () => {
    describe('JSONPath Extraction', () => {
        it('extracts the leaves JSONPaths from a JSON object', async () => {
            const inputPath = path.resolve(__dirname, 'fixtures/object.json');
            const expectedOutputPath = path.resolve(__dirname, 'expected/leaves.js');

            const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
            const jsonPaths = await getJSONPathsFromObject(input);
            const jsonPathsTree = new JSONPathsTree(jsonPaths);
            const output = new Set(
                jsonPathsTree.getLeaves().map(node => node.path)
            );

            const expectedOutput = (await import(expectedOutputPath)).paths;
            expect(output).to.deep.equal(expectedOutput);
        });

        it('extracts the leaves JSONPaths from the properties of a JSON schema', async () => {
            const inputPath = path.resolve(__dirname, 'fixtures/schema.json');
            const expectedOutputPath = path.resolve(__dirname, 'expected/leaves.js');

            const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
            const jsonPaths = await getJSONPathsFromSchema(input);
            const jsonPathsTree = new JSONPathsTree(jsonPaths);
            const output = new Set(
                jsonPathsTree.getLeaves().map(node => node.path)
            );

            const expectedOutput = (await import(expectedOutputPath)).paths;
            expect(output).to.deep.equal(expectedOutput);
        });
    });

    describe('JSONPath Tree Representation', () => {
        it('returns a tree representation of a JSON object', async () => {
            const inputPath = path.resolve(__dirname, 'fixtures/object.json');
            const expectedOutputPath = path.resolve(__dirname, 'expected/tree.txt');

            const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
            const jsonPaths = await getJSONPathsFromObject(input);
            const jsonPathsTree = new JSONPathsTree(jsonPaths);
            const output = jsonPathsTree.toString().trim();

            const expectedOutput = fs.readFileSync(expectedOutputPath, 'utf8').trim();
            expect(output).to.equal(expectedOutput);
        });

        it('returns a tree representation of a JSON schema', async () => {
            const inputPath = path.resolve(__dirname, 'fixtures/schema.json');
            const expectedOutputPath = path.resolve(__dirname, 'expected/tree.txt');

            const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
            const jsonPaths = await getJSONPathsFromSchema(input);
            const jsonPathsTree = new JSONPathsTree(jsonPaths);
            const output = jsonPathsTree.toString().trim(); 

            const expectedOutput = fs.readFileSync(expectedOutputPath, 'utf8').trim();
            expect(output).to.equal(expectedOutput);
        });
    });
});
