(function() {
    const {extend} = require('./data/node_requires/objectUtils');
    /* global monaco */

    /**
     * Adds custom hotkeys to the editors, specifically Ctrl+Plus, Ctrl+Minus for font size manipulation.
     * @param {AceEditor} editor The editor to which to add hotkeys
     * @returns {void}
     */
    var extendHotkeys = editor => {
        // eslint-disable-next-line no-bitwise
        editor.addCommand(monaco.KeyCode.Ctrl | monaco.KeyCode.US_EQUAL, function(editor) {
            var num = Number(localStorage.fontSize);
            if (num < 48) {
                num++;
                localStorage.fontSize = num;
                editor.tag.style.fontSize = num+'px';
            }
            return false;
        });
        // eslint-disable-next-line no-bitwise
        editor.addCommand(monaco.KeyCode.Ctrl | monaco.KeyCode.US_MINUS, function(editor) {
            var num = Number(localStorage.fontSize);
            if (num > 6) {
                num--;
                localStorage.fontSize = num;
                editor.tag.style.fontSize = num+'px';
            }
            return false;
        });
    };

    var defaultOptions = {
        language: 'plain_text',
        fontSize: localStorage.fontSize,
        theme: 'tomorrow',
        colorDecorators: true
    };

    const themeMappings = {
        Day: 'tomorrow',
        Night: 'ambiance',
        Horizon: 'horizon',
        default: 'tomorrow'
    };
    const glob = require('./data/node_requires/glob');
    glob.codeEditorThemeMappings = themeMappings;
    /**
     * Mounts a Monaco editor on the passed tag.
     *
     * @global
     * @param {HTMLTextareaElement|HTMLDivElement} tag A tag where an editor should be placed. It can be a textarea or any other block.
     * @param {Object} [options] Options
     * @param {String} [options.mode='plain_text'] Language mode. Sets syntacs highlighting and enables language checks, if relevant. Can be 'plain_text', 'markdown', 'javascript', 'html' or 'css'
     * @returns {AceEditor} Editor instance
     */
    window.setupCodeEditor = (tag, options) => {
        const opts = extend(extend({}, defaultOptions), options);
        opts.value = opts.value || tag.value || '';
        const codeEditor = monaco.editor.create(tag, opts);

        extendHotkeys(codeEditor);

        tag.codeEditor = codeEditor;
        codeEditor.tag = tag;
        return codeEditor;
    };
})(this);
