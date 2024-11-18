# JSONPath Extractor

A CLI tool and library for extracting and visualizing JSONPath(s) from JSON objects or JSONSchema(s). \
It includes utility functions and a tree representation class for enhanced manipulation and visualization of JSONPath structures.

## Features

- Extract JSONPath(s) from JSON objects or JSON Schemas
- Output options for leaf-only JSONPath(s) and JSON array formatting
- Visualize JSONPath(s) as a tree structure
- Exportable utility functions for programmatic use:
  - `getJSONPathsFromObject(obj)`
  - `getJSONPathsFromSchema(schema)` (asynchronous)
- Exportable `JSONPathsTree` class for processing JSONPaths:
  - Extract leaf nodes from a set of JSONPaths
  - Generate a tree-like string representation of JSONPaths

## Installation

Install dependencies by running:
```sh
npm install .
```

## Build Options

To compile the tool into a standalone binary executable, use the Makefile `compile` goal. \
Optionally specify a platform for compatibility:
```
make compile                    # Linux
make compile PLATFORM=darwin    # macOS
```

After compilation, the tool can be invoked directly by using the generated `./extract-jsonpaths` binary. \
For example:
```sh
./extract-jsonpaths extract <input-file>
```

## Usage

### Extract JSONPath(s)

Extract JSONPath(s) from JSON objects or JSON Schemas using the following commands:

- From a JSON object:
  ```sh
  node extract-jsonpaths extract <input-file>
  ```

- From a JSONSchema (use `-s` or `--from-schema`):
  ```
  node extract-jsonpaths extract <input-file> -s
  ```

### Customize Output

- Show only JSONPath(s) for leaf nodes (`-l` or `--leaves`):
  ```sh
  node extract-jsonpaths.js extract <input-file> -l
  ```
- Format output as a JSON array (`-j` or `--json`):
   ```sh
   node extract-jsonpaths.js extract <input-file> -j
   ```

### Tree Representation

View a tree representation of the JSONPath(s):
```sh
node extract-jsonpaths.js tree <input-file>
```

### Examples

- Extract and output leaf JSONPath(s) from a JSON Schema as a JSON array:
  ```sh
  node extract-jsonpaths.js extract <input-file> -slj
  ```

- Display a tree of JSONPath(s) from a JSON Schema:
  ```sh
  node extract-jsonpaths.js tree <input-file> -s
  ```

## Library Usage

### Extracting and Processing JSONPaths from a JSON Object

#### Sample JSON Object
```json
{
    "id": 1,
    "name": "Alice",
    "settings": {
        "theme": "dark"
    }
}
```

#### Steps
1. Extract JSONPaths using the `getJSONPathsFromObject` utility function
2. Create a `JSONPathsTree` from the extracted paths
3. Retrieve leaf nodes and visualize the tree structure

#### Code Example

```js
const { getJSONPathsFromObject } = require('jsonpath-extractor/utils');
const JSONPathsTree = require('jsonpath-extractor/lib').default;

// Step 1: Extract JSONPaths from the object
const jsonObject = {
    id: 1,
    name: "Alice",
    settings: {
        theme: "dark",
    },
};
const jsonPaths = getJSONPathsFromObject(jsonObject);
const paths = [...jsonPaths];
console.log("JSONPaths extracted from JSON object:");
console.log(paths.join('\n')); 
console.log('---');

// Step 2: Create a JSONPathsTree
const jsonPathsTree = new JSONPathsTree(jsonPaths);

// Step 3: Retrieve leaf nodes and output a tree representation
const leaves = jsonPathsTree.getLeaves().map(node => node.path);

console.log("Leaf JSONPaths extracted from JSON object:");
console.log(leaves.join('\n'));
console.log('---');

console.log("Tree representation of JSON object:");
console.log(jsonPathsTree.toString());
```

### Extracting and Processing JSONPaths from a JSONSchema

#### Sample JSONSchema
```json
{
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "settings": { "$ref": "#/definitions/settings" }
  },
  "definitions": {
    "settings": {
      "type": "object",
      "properties": { "theme": { "type": "string" } }
    }
  }
}
```

#### Steps
1. Extract JSONPaths using the `getJSONPathsFromSchema` utility function
2. Create a `JSONPathsTree` from the extracted paths
3. Retrieve leaf nodes and visualize the tree structure

#### Code Example

```js
const { getJSONPathsFromSchema } = require('jsonpath-extractor/utils');
const JSONPathsTree = require('jsonpath-extractor/lib').default;

(async () => {
    // Step 1: Extract JSONPaths from the JSONSchema
    const jsonSchema = {
        type: "object",
        properties: {
            id: { type: "integer" },
            name: { type: "string" },
            settings: { $ref: "#/definitions/settings" }
        },
        definitions: {
            settings: {
                type: "object",
                properties: { theme: { type: "string" } }
            }
        }
    };
    const jsonPaths = await getJSONPathsFromSchema(jsonSchema);
    const paths = [...jsonPaths];
    console.log("JSONPaths extracted from JSONSchema:");
    console.log(paths.join('\n')); 
    console.log('---');

    // Step 2: Create a JSONPathsTree
    const jsonPathsTree = new JSONPathsTree(jsonPaths);

    // Step 3: Retrieve leaf nodes and output a tree representation
    const leaves = jsonPathsTree.getLeaves().map(node => node.path);

    console.log("Leaf JSONPaths extracted from JSON schema:");
    console.log(leaves.join('\n'));
    console.log('---');

    console.log("Tree representation of JSON schema:");
    console.log(jsonPathsTree.toString());
})();
```

## Notes

- The `extract` subcommand is implicit if the user does not specify one:
  ```
  node extract-jsonpaths <input-file>
  ```

- For additional options or help, run the tool with the `--help` flag.
  ```sh
  node extract-jsonpaths --help
  ```
