# JSONPath Extractor

A CLI tool and library for extracting and visualizing JSONPath(s) from a JSON object or JSON Schema. \
It includes utility functions and a tree representation class for programmatic manipulation and visualization of JSONPath structures.

## Features

- Extract JSONPath(s) from a JSON object or JSON Schema
- Output options for leaf-only JSONPath(s) and JSON array formatting
- Visualize JSONPath(s) as a tree structure
- Exportable utility functions for programmatic use:
  - `async getJSONPathsFromObject(obj, leaves = false)`
  - `async getJSONPathsFromSchema(schema, leaves = false)`
- Exportable `JSONPathsTree` class for processing JSONPath(s):
  - Extract leaf nodes from a set of JSONPath(s)
  - Generate a tree-like string representation of JSONPath(s)

## Installation

### Global Install

To install the tool globally, run:
```sh
npm install -g extract-jsonpaths
```

The tool can then be invoked directly from the command line:
```sh
extract-jsonpaths extract <input-file>
```

### Local Install

To make the tool available within a specific project or directory, run:
```sh
npm install extract-jsonpaths
```

The tool can then be invoked using `npx` or directly from the `node_modules` local directory:
- Using `npx`:
  ```sh
  npx extract-jsonpaths extract <input-file>
  ```
- From `node_modules`:
  ```sh
  ./node_modules/.bin/extract-jsonpaths extract <input-file>
  ```

### Install from Source

Install the package from source after cloning this repository:
```sh
git clone https://github.com/alex-massa/extract-jsonpaths.git
cd extract-jsonpaths
npm install .
```

The tool can then be invoked using Node.js:
```sh
node extract-jsonpaths extract <input-file>
```

## Build Options

The Makefile `compile` goal will build a standalone binary executable which can be distributed to clients not running Node.js. \
Optionally specify a platform for compatibility:
```
make compile                    # Linux
make compile PLATFORM=darwin    # macOS
```

After compilation, the tool can be invoked via the generated `./extract-jsonpaths` binary:
```sh
./extract-jsonpaths extract <input-file>
```

## Usage

### Extract JSONPath(s)

Extract JSONPath(s) from JSON objects or JSON Schemas using the following commands:

- From a JSON object:
  ```sh
  npx extract-jsonpaths extract <input-file>
  ```

- From a JSON Schema (use `-s` or `--from-schema`):
  ```
  npx extract-jsonpaths extract <input-file> -s
  ```

### Customize Output

- Show only JSONPath(s) for leaf nodes (`-l` or `--leaves`):
  ```sh
  npx extract-jsonpaths extract <input-file> -l
  ```
- Format output as a JSON array (`-j` or `--json`):
  ```sh
  npx extract-jsonpaths extract <input-file> -j
  ```

### Tree Representation

View a tree representation of the JSONPath(s):
```sh
npx extract-jsonpaths tree <input-file>
```

### Examples

- Extract and output leaf JSONPath(s) from a JSON Schema as a JSON array:
  ```sh
  npx extract-jsonpaths extract <input-file> -slj
  ```

- Display a tree of JSONPath(s) from a JSON Schema:
  ```sh
  npx extract-jsonpaths tree <input-file> -s
  ```

## Library Usage

### Extracting and Processing JSONPath(s) from a JSON Object

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
1. Extract JSONPath(s) using the `getJSONPathsFromObject` utility function
2. Extract JSONPath(s) leaves using the `getJSONPathsFromObject` utility function by setting the `leaves` argument to `true`
3. Output a tree representation of the JSON object

#### Code Example

```js
const { getJSONPathsFromObject } = require('extract-jsonpaths/utils');
const JSONPathsTree = require('extract-jsonpaths/lib').default;

(async () => {
    const jsonObject = {
        id: 1,
        name: "Alice",
        settings: {
            theme: "dark",
        },
    };

    // Step 1: Extract JSONPath(s) from the object
    const jsonPaths = await getJSONPathsFromObject(jsonObject);
    console.log("JSONPath(s) extracted from JSON object:");
    console.log([...jsonPaths].join('\n')); 
  
    console.log('---');

    // Step 2: Extract JSONPath(s) leaves from the objet
    const jsonPathsLeaves = await getJSONPathsFromObject(jsonObject, true);
    console.log("JSONPath(s) leaves extracted from JSON object:");
    console.log([...jsonPathsLeaves].join('\n'));

    console.log('---');

    // Step 3: Create a JSONPathsTree and output a tree representation of the JSON object
    const jsonPathsTree = new JSONPathsTree(jsonPaths);
    console.log("Tree representation of JSON object:");
    console.log(jsonPathsTree.toString());
})();
```

### Extracting and Processing JSONPath(s) from a JSON Schema

#### Sample JSON Schema
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
1. Extract JSONPath(s) using the `getJSONPathsFromSchema` utility function
2. Extract JSONPath(s) leaves using the `getJSONPathsFromSchema` utility function by setting the `leaves` argument to `true`
3. Output a tree representation of the JSON Schema

#### Code Example

```js
const { getJSONPathsFromSchema } = require('extract-jsonpaths/utils');
const JSONPathsTree = require('extract-jsonpaths/lib').default;

(async () => {
    // Step 1: Extract JSONPath(s) from the JSON Schema
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

    // Step 1: Extract JSONPath(s) from the JSON Schema
    const jsonPaths = await getJSONPathsFromSchema(jsonSchema);
    console.log("JSONPath(s) extracted from JSON Schema:");
    console.log([...jsonPaths].join('\n')); 
  
    console.log('---');

    // Step 2: Extract JSONPath(s) leaves from the JSON Schema
    const jsonPathsLeaves = await getJSONPathsFromSchema(jsonSchema, true);
    console.log("JSONPath(s) leaves extracted from JSON Scheam:");
    console.log([...jsonPathsLeaves].join('\n'));

    console.log('---');

    // Step 3: Create a JSONPathsTree and output a tree representation of the JSON Schema
    const jsonPathsTree = new JSONPathsTree(jsonPaths);
    console.log("Tree representation of JSON Schema:");
    console.log(jsonPathsTree.toString());
})();
```

## Notes

- The `extract` subcommand is implicit if the user does not specify one:
  ```
  npx extract-jsonpaths <input-file>
  ```

- The tool accepts input from standard input. \
  For example:
  ```sh
  cat <input-file> | npx extract-jsonpaths
  ```
  This is also valid, and generally performs quicker over input piping:
  ```sh
  < <input-file> npx extract-jsonpaths
  ```

- For additional options or help, run the tool with the `--help` flag.
  ```sh
  npx extract-jsonpaths --help
  ```
