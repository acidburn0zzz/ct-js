ct.styles = {
    types: { },
    /**
     * Creates a new style with a given name. Technically, it just writes `data` to `ct.styles.types`.
     * @param {string} name The name of a new style
     * @param {Object} data The style data
     * @returns {Object} The passed `data` object
     */
    new(name, data) {
        ct.styles.types[name] = data;
        return data;
    },
    /**
     * Returns a style of a given name. The actual behavior strongly depends on `copy` parameter.
     * @param {string} name The name of the style to load
     * @param {boolean|Object} [copy] If not set, returns the source style object. Editing it will affect all new style calls.
     *      When set to `true`, will create a new object, which you can safely modify without affecting the source style.
     *      When set to an object, this will create a new object as well, augmenting it with given properties.
     * @returns {Object} The resulting style
     */
    get(name, copy) {
        if (copy === true) {
            return ct.u.ext({}, ct.styles.types[name]);
        }
        if (copy) {
            return ct.u.ext(ct.u.ext({}, ct.styles.types[name]), copy);
        }
        return ct.styles.types[name];
    }
};
/*@styles@*/
/*%styles%*/
