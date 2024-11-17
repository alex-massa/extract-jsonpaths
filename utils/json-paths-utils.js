/**
 * Recursive function to get all JSONPaths from a JSON object
 * @param {object} obj - The JSON object
 * @returns {Set<string>} The set of JSONPaths
 */
export function getJSONPathsFromObject(obj) {
    function extractPaths(obj, path = '$', paths = new Set()) {
        if (obj && typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                const currentPath = `${path}.${key}`;
                if (Array.isArray(obj[key])) {
                    // for arrays, add the path with [*] notation
                    const arrayPath = `${currentPath}[*]`;
                    paths.add(arrayPath);
                    obj[key].forEach(item => {
                        extractPaths(item, arrayPath, paths);
                    });
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    // for nested objects, add the path and recurse
                    paths.add(currentPath);
                    extractPaths(obj[key], currentPath, paths);
                } else {
                    // for primitive values, just add the path
                    paths.add(currentPath);
                }
            }
        }
        return paths;
    }

    return extractPaths(obj);
}

/**
 * Recursive function to get all JSONPaths from a JSONSchema within $.properties
 * @param {object} schema - The JSONSchema object
 * @returns {Set<string>} The set of JSONPaths
 */
export async function getJSONPathsFromSchema(schema) {
    function extractPaths(obj, path = '$', paths = new Set()) {
        if (obj && typeof obj === 'object' && obj !== null) {
            for (const key in obj) {
                const currentPath = `${path}.${key}`;
                // check if the current key is an array
                if (obj[key]?.type === 'array' && obj[key].items) {
                    const arrayPath = `${currentPath}[*]`;
                    // add the array path only if it doesn't exist
                    paths.add(arrayPath);
                    // recursively get properties of the items
                    extractPaths(obj[key].items.properties, arrayPath, paths);
                } else {
                    // add the current path if it's not already included
                    paths.add(currentPath);
                    // check for properties or items of non-array objects
                    extractPaths(obj[key].properties || obj[key].items?.properties, currentPath, paths);
                }
            }
        }
        return paths;
    }

    const { $RefParser } = await import('@apidevtools/json-schema-ref-parser');
    const resolvedSchema = await $RefParser.dereference(schema, { mutateInputSchema: false });
    const schemaProperties = resolvedSchema.properties;
    return schemaProperties ? extractPaths(schemaProperties) : new Set();
}
