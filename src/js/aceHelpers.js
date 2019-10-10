(function() {
    const {extend} = require('./data/node_requires/utils');
    const monaco = require('monaco');
    var ctjsCoreCompletions = [
        'ct.pixiApp',
        'ct.libs',
        'ct.speed',
        'ct.delta',
        'ct.stack',
        'ct.types',
        'ct.types.Copy()',
        'ct.types.list[\'Type\']',
        'ct.types.make(\'Type\', x, y)',
        'ct.types.move(copy)',
        'ct.types.addSpeed(copy, speed, dir)',
        'ct.types.each(copy, function() {})',
        'ct.types.with(copy, function() {})',
        'ct.types.copy(\'Type\', x, y)',
        'ct.types.addSpd(copy, speed, dir)',
        'ct.fps',
        'ct.version',
        'ct.width',
        'ct.height',
        'ct.pixiApp',
        'ct.styles.get(\'StyleName\')',
        'ct.styles.get(\'StyleName\' {/* overrides */})',
        'ct.u.ldx(length, dir)',
        'ct.u.ldy(length, dir)',
        'ct.u.pdn(x1, y1, x2, y2)',
        'ct.u.pdc(x1, y1, x2, y2)',
        'ct.u.deltaDir(dir1, dir2)',
        'ct.u.clamp(min, value, max)',
        'ct.u.lerp(a, b, alpha)',
        'ct.u.unlerp(a, b, value)',
        'ct.u.prect(x, y, copy)',
        'ct.u.pcircle(x, y, copy)',
        'ct.u.ext(destination, source)',
        'ct.u.inspect(obj)',
        'ct.u.load(scriptUrl)',
        'ct.u.wait(1000)',
        'ct.u.lengthDirX(length, dir)',
        'ct.u.lengthDirY(length, dir)',
        'ct.u.pointDirection(x1, y1, x2, y2)',
        'ct.u.pointDistance(x1, y1, x2, y2)',
        'ct.u.pointRectangle(x, y, copy)',
        'ct.u.pointCircle(x, y, copy)',
        'ct.mouse.x',
        'ct.mouse.y',
        'ct.mouse.xprev',
        'ct.mouse.yprev',
        'ct.mouse.inside',
        'ct.mouse.pressed',
        'ct.mouse.down',
        'ct.mouse.released',
        'ct.mouse.button',
        'ct.mouse.clear()',
        'ct.mouse.hovers(copy)',
        'ct.rooms.templates[\'Room\']',
        'ct.rooms.make.apply(room)',
        'ct.rooms.clear()',
        'ct.rooms.switch(\'NewRoom\')',
        'ct.res.fetchImage(url, function(error, image) {})',
        'ct.res.getTexture(\'SpriteName\', frame)',
        'ct.sound.spawn(\'Name\', options)',
        'ct.room',
        'ct.room.center',
        'ct.room.name',
        'ct.room.borderY',
        'ct.room.borderX',
        'ct.room.follow',
        'ct.room.followDrift',
        'ct.room.followShiftX',
        'ct.room.followShiftY',
        'ct.room.x',
        'ct.room.y',
        'this.speed',
        'this.direction',
        'this.gravity',
        'this.gravityDir',
        'this.hspeed',
        'this.vspeed',
        'this.move()'
    ];
    var prepareCompletions = (array, meta) => array.map(function(word) {
        return {
            caption: word,
            value: word,
            meta
        };
    });
    var jsCompleter = {
        getCompletions(editor, session, pos, prefix, callback) {
            callback(null, prepareCompletions(ctjsCoreCompletions, 'core'));
        }
    };

    /**
     * Добавляет пользовательские хоткеи к редактору.
     * @param {AceEditor} editor Редактор, к которому привязываются хоткеи
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
        fontSize: localStorage.fontSize
    };

    const themeMappings = {
        Day: 'tomorrow',
        Night: 'ambiance',
        Horizon: 'horizon',
        default: 'tomorrow'
    };
    const glob = require('./data/node_requires/glob');
    glob.aceThemeMappings = themeMappings;
    /**
     * Mounts an Ace editor on the passed tag.
     *
     * @global
     * @param {HTMLTextareaElement|HTMLDivElement} tag A tag where an editor should be placed. It can be a textarea or any other block.
     * @param {Object} [options] Options
     * @param {String} [options.mode='plain_text'] Language mode. Sets syntacs highlighting and enables language checks, if relevant. Can be 'plain_text', 'markdown', 'javascript', 'html' or 'css'
     * @returns {AceEditor} Editor instance
     */
    window.setupAceEditor = (tag, options) => {
        const opts = extend(extend({}, defaultOptions), options);
        opts.value = opts.value || tag.value || '';
        const codeEditor = monaco.editor.create(tag, opts);

        extendHotkeys(codeEditor);

        tag.codeEditor = codeEditor;
        codeEditor.tag = tag;
        return codeEditor;
    };
})(this);
