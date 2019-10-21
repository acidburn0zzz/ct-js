(function() {
    const {extend} = require('./data/node_requires/objectUtils');
    const fs = require('fs-extra');
    /* global monaco riot */

    const lib = [
        './data/typedefs/global.d.ts',
        './node_modules/pixi.js/pixi.js.d.ts'
    ];

    window.signals = window.signals || riot.observable({});
    window.signals.on('monacoBooted', () => {
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
            noLib: true,
            allowNonTsExtensions: true
        });
        monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
            noLib: true,
            allowNonTsExtensions: true
        });

        for (const file of lib) {
            fs.readFile(file, {
                encoding: 'utf-8'
            })
            .then(data => {
                monaco.languages.typescript.javascriptDefaults.addExtraLib(data);
                monaco.languages.typescript.typescriptDefaults.addExtraLib(data);
            });
        }
    });

    /**
     * Adds custom hotkeys to the editors, specifically Ctrl+Plus, Ctrl+Minus for font size manipulation.
     * @param {any} editor The editor to which to add hotkeys
     * @returns {void}
     */
    var extendHotkeys = editor => {
        // eslint-disable-next-line no-bitwise
        /*editor.addCommand(monaco.KeyCode.Ctrl | monaco.KeyCode.US_EQUAL, function(editor) {
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
        });*/
    };

    const isRangeSelection = function(s) {
        if (s.selectionStartLineNumber !== s.positionLineNumber) {
            return true;
        }
        if (s.selectionStartColumn !== s.positionColumn) {
            return true;
        }
        return false;
    };

    const setUpWrappers = function(editor, options) {
        // Prohibit use of Delete & Backspace on editable edges
        editor.onKeyDown(function(evt) {
            const model = editor.getModel();
            const maxLine = model.getLineCount() - 1;
            const lastLineCol = model.getLineContent(maxLine).length + 1;
            console.log(evt, editor.getSelections(), lastLineCol, maxLine);
            if (evt.code === 'Delete') {
                const selections = editor.getSelections();
                for (const selection of selections) {
                    // Range selections are safe as they delete the selection's contents,
                    // not characters before or after them.
                    if (isRangeSelection(selection)) {
                        continue;
                    }
                    // As this is a plain cursor, let's check
                    // just one pair of its parameters
                    if (selection.selectionStartLineNumber === maxLine &&
                        selection.selectionStartColumn === lastLineCol
                    ) {
                        console.log('I\'m trying :c');
                        evt.preventDefault();
                        return;
                    }
                }
            } else if (evt.code === 'Backspace') {
                const selections = editor.getSelections();
                for (const selection of selections) {
                    if (isRangeSelection(selection)) {
                        continue;
                    }
                    if (selection.selectionStartLineNumber === 2 &&
                        selection.selectionStartColumn === 1
                     ) {
                        console.log('I\'m trying :c');
                        evt.preventDefault();
                        return;
                    }
                }
            }
        });
        // Clamp selections so they can't select wrapping lines
        editor.onDidChangeCursorSelection(function(evt) {
            let resetSelections = false;
            const selections = [evt.selection, ...evt.secondarySelections];
            const model = editor.getModel();
            const maxLine = model.getLineCount() - 1;
            const lastLineCol = model.getLineContent(maxLine - 1).length - 1;
            for (const selection of selections) {
                if (selection.selectionStartLineNumber < 2) {
                    selection.selectionStartLineNumber = 2;
                    selection.selectionStartColumn = 1;
                    resetSelections = true;
                }
                if (selection.positionLineNumber < 2) {
                    selection.positionLineNumber = 2;
                    selection.positionColumn = 1;
                    resetSelections = true;
                }
                if (selection.selectionStartLineNumber > maxLine) {
                    selection.selectionStartLineNumber = maxLine;
                    selection.selectionStartColumn = lastLineCol;
                    resetSelections = true;
                }
                if (selection.positionLineNumber > maxLine) {
                    selection.positionLineNumber = maxLine;
                    selection.positionColumn = lastLineCol;
                    resetSelections = true;
                }
            }
            if (resetSelections) {
                editor.setSelections(selections);
            }
        });
    };

    var defaultOptions = {
        language: 'plain_text',
        fixedOverflowWidgets: true,
        fontSize: localStorage.fontSize,
        fontFamily: localStorage.fontFamily || 'Iosevka, monospace',
        theme: 'tomorrow',
        colorDecorators: true,

        get fontLigatures() {
            return localStorage.codeLigatures !== 'off';
        }
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
     * @returns {any} Editor instance
     */
    window.setupCodeEditor = (tag, options) => {
        const opts = extend(extend({}, defaultOptions), options);
        opts.value = opts.value || tag.value || '';
        if (opts.wrapper) {
            opts.value = `${opts.wrapper[0]}\n${opts.value}\n${opts.wrapper[1]}`;
        }
        console.log(opts);
        const codeEditor = monaco.editor.create(tag, opts);

        if (opts.lockWrapper) {
            setUpWrappers(codeEditor, opts);
        }
        extendHotkeys(codeEditor);

        tag.codeEditor = codeEditor;
        codeEditor.tag = tag;
        return codeEditor;
    };
})(this);
