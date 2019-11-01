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

    const setUpWrappers = function(editor) {
        editor.setPosition({
            column: 0,
            lineNumber: 2
        });
        /* These signal to custom commands
           that the current cursor's position is in the end/start of the editable range */
        const contextSOR = editor.createContextKey('startOfEditable', false),
              contextEOR = editor.createContextKey('endOfEditable', false);

        // Turns out the Delete and Backspace keys do not produce a keyboard event but commands
        // These commands overlay the default ones, thus cancelling the default behaviour
        // @see https://github.com/microsoft/monaco-editor/issues/940
        editor.addCommand(monaco.KeyCode.Backspace, function() {
            void 0; // woo!
            console.log('woo');
        }, 'startOfEditable');
        editor.addCommand(monaco.KeyCode.Delete, function() {
            void 0; // magic!
            console.log('woo');
        }, 'endOfEditable');

        // Clamp selections so they can't select wrapping lines
        editor.onDidChangeCursorSelection(function(evt) {
            let resetSelections = false;
            const selections = [evt.selection, ...evt.secondarySelections];
            const model = editor.getModel();
            const maxLine = model.getLineCount() - 1;
            const lastLineCol = model.getLineContent(Math.max(maxLine, 1)).length + 1;

            contextEOR.set(false);
            contextSOR.set(false);

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
                /* Get if any of the cursors happened to be in the beginning/end
                   of the editable range, so that we can block Delete/Backspace behavior.
                   Range selections are safe, as they delete the selected content,
                   not that is behind/in front of them.
                */
                if (!isRangeSelection(selection)) {
                    if (selection.selectionStartLineNumber === 2 &&
                        selection.selectionStartColumn === 1
                    ) {
                        contextSOR.set(true);
                        console.log('Start on');
                    }
                    console.log([selection.positionLineNumber, maxLine], [selection.positionColumn, lastLineCol]);
                    if (selection.positionLineNumber === maxLine &&
                        selection.positionColumn === lastLineCol
                    ) {
                        contextEOR.set(true);
                        console.log('End on');
                    }
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
            opts.lineNumbers = num => Math.max((num || 0) - 1, 1);
        }
        console.log(opts);
        const codeEditor = monaco.editor.create(tag, opts);

        if (opts.lockWrapper) {
            setUpWrappers(codeEditor);
        }
        extendHotkeys(codeEditor);

        tag.codeEditor = codeEditor;
        codeEditor.tag = tag;
        return codeEditor;
    };
})(this);
