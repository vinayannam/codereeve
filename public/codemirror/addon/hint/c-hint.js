// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/LICENSE

(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    var Pos = CodeMirror.Pos;

    function forEach(arr, f) {
        for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
    }

    function arrayContains(arr, item) {
        if (!Array.prototype.indexOf) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === item) {
                    return true;
                }
            }
            return false;
        }
        return arr.indexOf(item) != -1;
    }

    var WORD = /[\w$]+/,
        RANGE = 500;

    function scriptHint(editor, keywords, getToken, options) {
        var word = options && options.word || WORD;
        var range = options && options.range || RANGE;
        var cur = editor.getCursor(),
            curLine = editor.getLine(cur.line);
        var end = cur.ch,
            start = end;
        while (start && word.test(curLine.charAt(start - 1))) --start;
        var curWord = start != end && curLine.slice(start, end);

        var list = options && options.list || [],
            seen = {};
        var re = new RegExp(word.source, "g");
        for (var dir = -1; dir <= 1; dir += 2) {
            var line = cur.line,
                endLine = Math.min(Math.max(line + dir * range, editor.firstLine()), editor.lastLine()) + dir;
            for (; line != endLine; line += dir) {
                var text = editor.getLine(line),
                    m;
                while (m = re.exec(text)) {
                    if (line == cur.line && m[0] === curWord) continue;
                    if ((!curWord || m[0].lastIndexOf(curWord, 0) == 0) && !Object.prototype.hasOwnProperty.call(seen, m[0])) {
                        seen[m[0]] = true;
                        list.push(m[0]);
                    }
                }
            }
        }
        // Find the token at the cursor
        var cur = editor.getCursor(),
            token = getToken(editor, cur);
        if (/\b(?:string|comment)\b/.test(token.type)) return;
        var innerMode = CodeMirror.innerMode(editor.getMode(), token.state);
        if (innerMode.mode.helperType === "json") return;
        token.state = innerMode.state;

        // If it's not a 'word-style' token, ignore the token.
        if (!/^[\w$_]*$/.test(token.string)) {
            token = {
                start: cur.ch,
                end: cur.ch,
                string: "",
                state: token.state,
                type: token.string == ":" ? "c-type" : null
            };
        }
        if (!context) var context = [];
        context.push(token);
        return {
            list: list.concat(getCompletions(token, context, keywords, options)),
            from: Pos(cur.line, token.start),
            to: Pos(cur.line, token.end)
        };
    }

    function cHint(editor, options) {
        return scriptHint(editor, cKeywords,
            function(e, cur) { return e.getTokenAt(cur); },
            options);
    };
    CodeMirror.registerHelper("hint", "c", cHint);

    var cKeywords = ("auto double break else case enum char extern const float continue for default goto do if " +
        "int long register return short signed sizeof static struct switch typedef union unsigned void volatile while " +
        "isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper perror strerror " +
        "strtok calloc free malloc realloc memcpy memcmp memchr memset memmove " +
        "strcpy strncpy strcmp strncmp strlen strcat strncat strchr strrchr strstr").split(" ");

    function getCompletions(token, context, keywords, options) {
        var found = [],
            start = token.string,
            global = options && options.globalScope || window;

        function maybeAdd(str) {
            if (str.lastIndexOf(start, 0) == 0 && !arrayContains(found, str)) found.push(str);
        }

        function gatherCompletions(_obj) {
            forEach(keywords, maybeAdd);
        }

        if (context) {
            // If this is a property, see if it belongs to some object we can
            // find in the current environment.
            var obj = context.pop(),
                base;

            if (obj.type == "variable")
                base = obj.string;
            else if (obj.type == "variable-3")
                base = ":" + obj.string;

            while (base != null && context.length)
                base = base[context.pop().string];
            if (base != null) gatherCompletions(base);
        }
        return found;
    }
});