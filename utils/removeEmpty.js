function removeEmpty(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => removeEmpty(item)).filter(item => item !== null && item !== undefined);
    }
    
    if (typeof obj === 'object') {
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = removeEmpty(obj[key]);
                if (value !== null && value !== undefined) {
                    result[key] = value;
                }
            }
        }
        return Object.keys(result).length > 0 ? result : undefined;
    }
    
    return obj;
}

module.exports = { removeEmpty };
