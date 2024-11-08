/**
 * Recursive function to get all JSONPaths from a JSON object
 * @param {object} obj - The JSON object
 * @param {string} [path=$] - The current JSONPath
 * @param {Set<string>} [paths=new Set()] - The set of JSONPaths
 * @returns {Set<string>} The set of JSONPaths
 */
export function getJSONPathsFromObject(obj, path = '$', paths = new Set()) {
    if (obj && typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
            const currentPath = `${path}.${key}`;
            if (Array.isArray(obj[key])) {
                // for arrays, add the path with [*] notation
                const arrayPath = `${currentPath}[*]`;
                paths.add(arrayPath);
                obj[key].forEach(item => {
                    getJSONPathsFromObject(item, arrayPath, paths);
                });
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                // for nested objects, add the path and recurse
                paths.add(currentPath);
                getJSONPathsFromObject(obj[key], currentPath, paths);
            } else {
                // for primitive values, just add the path
                paths.add(currentPath);
            }
        }
    }
    return paths;
}

/**
 * Recursive function to get all JSONPaths from a JSONSchema within $.properties
 * @param {object} obj - The JSONSchema object
 * @param {string} [path=$] - The current JSONPath
 * @param {Set<string>} [paths=new Set()] - The set of JSONPaths
 * @returns {Set<string>} The set of JSONPaths
 */
export function getJSONPathsFromSchema(obj, path = '$', paths = new Set()) {
    if (obj && typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
            const currentPath = `${path}.${key}`;
            // check if the current key is an array
            if (obj[key].type === 'array' && obj[key].items) {
                const arrayPath = `${currentPath}[*]`;
                // add the array path only if it doesn't exist
                paths.add(arrayPath);
                // recursively get properties of the items
                getJSONPathsFromSchema(obj[key].items.properties, arrayPath, paths);
            } else {
                // add the current path if it's not already included
                paths.add(currentPath);
                // check for properties or items of non-array objects
                getJSONPathsFromSchema(obj[key].properties || obj[key].items?.properties, currentPath, paths);
            }
        }
    }
    return paths;
}
