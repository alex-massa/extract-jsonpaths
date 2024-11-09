# JSONPath Extractor

A CLI tool to extract JSONPath(s) from a JSON object or JSON Schema.

## Installation

To install the dependencies, run:

```sh
npm install
```

## Usage

### Extract JSONPath(s)

- To extract JSONPath(s) from a JSON object, run:

    ```sh
    node extract-jsonpaths.js extract <input-file>
    ```

- To extract JSONPath(s) from a JSON Schema, provide the `-s` or `--from-schema` flag:

    ```sh
    node extract-jsonpaths.js extract <input-file> -s
    ```

### Output Options

- To output only the JSONPath(s) relative to leaf nodes, provide the `-l` or `--leaves` flag:

    ```sh
    node extract-jsonpaths.js extract <input-file> -l
    ```
- To output the extracted JSONPath(s) as a JSON array, provide the `-j` or `--json` flag:

    ```sh
    node extract-jsonpaths.js extract <input-file> -j
    ```
### Tree View

To output a tree representation of the JSONPath(s), invoke the `tree` subcommand:

```sh
node extract-jsonpaths.js tree <input-file>
```

### Miscellaneous Examples

- Output as a JSON array the JSONPath(s) relative to the leaf nodes of a JSON Schema:
    
    ```sh
    node extract-jsonpaths.js extract <input-file> -slj
    ```

- Output a tree representation of the JSONPath(s) extracted from a JSON schema:

    ```sh
    node extract-jsonpaths.js tree <input-file> -s
    ```
