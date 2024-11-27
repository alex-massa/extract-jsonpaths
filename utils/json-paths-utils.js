/**
 * Returns a subset of JSONPaths comprised exclusively of the leaf elements
 * @param {Set<string>} jsonPaths - The set of JSONPaths
 * @returns {Promise<Set<string>>} A promise that resolves to a set of leaf JSONPaths
 */
async function getLeavesFromPaths(jsonPaths) {
    if (!Boolean(jsonPaths?.size)) {
        return jsonPaths;
    }
    const JSONPathsTree = (await import('../lib/json-paths-tree.js')).default;
    const jsonPathsTree = new JSONPathsTree(jsonPaths);
    return new Set(jsonPathsTree.getLeaves().map(node => node.path));
}

/**
 * Recursive function to get all JSONPaths from a JSON object
 * @param {object} obj - The JSON object
 * @param {boolean} [leaves=false] - If true, returns only leaf JSONPaths; otherwise, all paths are returne
 * @returns {Promise<Set<string>>} A promise that resolves to a set of JSONPaths
 */
export async function getJSONPathsFromObject(obj, leaves = false) {
    function extractPaths(obj, path = '$', paths = new Set()) {
        if (obj && typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                const currentPath = `${path}.${key}`;
                const currentItem = obj[key];
                if (Array.isArray(currentItem)) {
                    // for arrays, add the path with [*] notation
                    const arrayPath = `${currentPath}[*]`;
                    paths.add(arrayPath);
                    currentItem.forEach(item => {
                        extractPaths(item, arrayPath, paths);
                    });
                } else if (typeof currentItem === 'object' && currentItem !== null) {
                    // for nested objects, add the path and recurse
                    paths.add(currentPath);
                    extractPaths(currentItem, currentPath, paths);
                } else {
                    // for primitive values, just add the path
                    paths.add(currentPath);
                }
            }
        }
        return paths;
    }

    const jsonPaths = extractPaths(obj);
    return leaves ? await getLeavesFromPaths(jsonPaths) : jsonPaths;
}

/**
 * Recursive function to get all JSONPaths from a JSON Schema within $.properties
 * @param {object} schema - The JSON Schema object
 * @param {boolean} [leaves=false] - If true, returns only leaf JSONPaths; otherwise, all paths are returned
 * @returns {Promise<Set<string>>} A promise that resolves to a set of JSONPaths
 */
export async function getJSONPathsFromSchema(schema, leaves = false) {
    const processSchemaPart = (schemaPart, path = '$', paths = new Set()) => {
        for (const key in schemaPart) {
            let currentItem = schemaPart[key];
            if (key === 'properties' && currentItem) {
                extractPaths(currentItem, path, paths);
            } else if (['oneOf', 'anyOf', 'allOf', 'if', 'then', 'else'].includes(key)) {
                // wrap in array if single item
                if (!Array.isArray(currentItem)) {
                    currentItem = [currentItem, ];
                }
                currentItem.forEach((schemaSubpart) => {
                    if (schemaSubpart.properties) {
                        extractPaths(schemaSubpart.properties, path, paths);
                    }
                });
            }
        }
        return paths;
    };
    const extractPaths = (obj, path = '$', paths = new Set()) => {
        if (obj && typeof obj === 'object') {
            for (const key in obj) {
                const currentPath = `${path}.${key}`;
                const currentItem = obj[key];
                // check if current item is an array with 'items' or an object with 'properties'
                if (currentItem?.type === 'array' && currentItem.items) {
                    // handle array paths
                    const arrayPath = `${currentPath}[*]`;
                    paths.add(arrayPath);
                    if (currentItem.items?.properties) {
                        extractPaths(currentItem.items.properties, arrayPath, paths);
                    }
                } else {
                    // add current path in set if not already included
                    paths.add(currentPath);
                    // handle 'properties' or 'items.properties' recursively
                    if (currentItem?.properties) {
                        extractPaths(currentItem.properties, currentPath, paths);
                    } else if (currentItem?.items?.properties) {
                        extractPaths(currentItem.items.properties, currentPath, paths);
                    }
                    processSchemaPart(currentItem, currentPath, paths);
                }
            }
        }
        return paths;
    }

    const { $RefParser } = await import('@apidevtools/json-schema-ref-parser');
    const resolvedSchema = await $RefParser.dereference(schema, { mutateInputSchema: false });
    const jsonPaths = processSchemaPart(resolvedSchema);
    return leaves ? await getLeavesFromPaths(jsonPaths) : jsonPaths;
}
