import fs from 'fs';
import path from 'path';
import { expect } from 'chai';
import { fileURLToPath } from 'url';
import { getJSONPathsFromObject, getJSONPathsFromSchema } from '../utils/json-paths-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('JSON Paths Utilities', () => {
    describe('getJSONPathsFromObject', () => {
        it('extracts JSONPaths from a JSON object', async () => {
            const inputPath = path.resolve(__dirname, 'fixtures/object.json');
            const expectedOutputPath = path.resolve(__dirname, 'expected/paths.js');
            const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
            const output = getJSONPathsFromObject(input);
            const expectedOutput = (await import(expectedOutputPath)).paths;
            expect(output).to.deep.equal(expectedOutput);
        });
    });

    describe('getJSONPathsFromSchema', () => {
        it('extracts JSONPaths from the properties of a JSON schema', async () => {
            const inputPath = path.resolve(__dirname, 'fixtures/schema.json');
            const expectedOutputPath = path.resolve(__dirname, 'expected/paths.js');
            const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
            const output = await getJSONPathsFromSchema(input);
            const expectedOutput = (await import(expectedOutputPath)).paths;
            expect(output).to.deep.equal(expectedOutput);
        });
    });
});
