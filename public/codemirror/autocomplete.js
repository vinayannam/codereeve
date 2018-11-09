console.log("test");
var KEYWORDS = ["abstract", "assert", "break", "case", "catch", "class", "const", "continue", "default", "do", "else", "enum", "extends", "final", "finally", "float", "for", "if", "implements", "import", "instanceof", "interface", "native", "new", "package", "private", "protected", "public", "return", "static", "strictfp", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "try", "volatile", "while", "byte", "short", "int", "long", "float", "double", "boolean", "char", "void", "true", "false", "null", ];
var SHORTCUTS = { sysout: 'System.out.println()', syserr: 'System.err.println()', }
var classFullNameMap = {};
var allClasses = [];
var classDetails = {};
var classesTrie;
var keywordsTrie;
var shortcutsTrie;

function updateClassDetails(obj) { classDetails = obj; }

function updateClassNames(obj) {
    console.log("updateClassNames called");
    classFullNameMap = obj;
    console.log("creating classes trie");
    classesTrie = new Triejs();
    for (var property in obj) { if (obj.hasOwnProperty(property)) { classesTrie.add(obj[property].name, obj[property]); } }
    createKeywordsTrie();
    createShortcutsTrie();
}

function createKeywordsTrie() {
    keywordsTrie = new Triejs();
    for (var property in KEYWORDS) { if (KEYWORDS.hasOwnProperty(property)) { keywordsTrie.add(KEYWORDS[property], { text: KEYWORDS[property] }); } }
    console.log("keywordsTrie created");
}

function createShortcutsTrie() {
    shortcutsTrie = new Triejs();
    for (var property in SHORTCUTS) { if (SHORTCUTS.hasOwnProperty(property)) { shortcutsTrie.add(property, { text: property, displayText: SHORTCUTS[property], hint: completeShortcut, expandedText: SHORTCUTS[property] }) } }
    console.log("shortcutsTrie created");
}
var JAVA_MODIFIERS = ['public', 'protected', 'private', 'static', 'abstract', 'final', 'native', 'synchronized', 'transient', 'volatile', 'strictfp'];

function isModifier(word) { return JAVA_MODIFIERS.indexOf(word) >= 0; }
var JAVA_BASIC_TYPES = ['byte', 'Short', 'char', 'int', 'long', 'float', 'double', 'boolean'];

function isBasicType(word) { return JAVA_BASIC_TYPES.indexOf(word) >= 0; }

function parseJavaContents(editor, cursor) {
    var tokens = [];
    var pos = { line: 0, ch: 0, n: 0, i: 0 };
    var currentTokenIndex = -1;
    var variables = {};
    var startDeclaration = false;
    var continueDeclaration = false;
    var angledBrackets = 0;
    var declarationTokens = [];
    var tokens = [];
    CodeMirror.runMode(editor.getValue(), "text/x-java", function(token, styleClass) {
        if (token.trim() !== "") {
            tokens.push({ 'token': token, 'type': styleClass, 'index': pos.i, pos: { line: pos.line, ch: pos.ch } });
            pos.i++;
            if (pos.line < cursor.line) { currentTokenIndex++; } else if (pos.line == cursor.line && pos.ch < cursor.ch) { currentTokenIndex++; }
        }
        if (token === '\n') {
            pos.ch = 0;
            pos.line++;
        } else {
            pos.n += token.length;
            pos.ch += token.length;
        }
        if (continueDeclaration && token.trim() !== "") {
            if (declarationTokens.length > 0 && (declarationTokens[0].token === 'class' || declarationTokens[0].token === 'interface' || declarationTokens[0].token === 'enum')) {
                if (token === '{') {
                    var newVal = variables[declarationTokens[1].token] || [];
                    newVal.push(declarationTokens);
                    variables[declarationTokens[1].token] = newVal;
                    continueDeclaration = false;
                    declarationTokens = [];
                } else { declarationTokens.push(tokens[pos.i - 1]); }
            }
        }
        if (startDeclaration && token.trim() !== "") {
            if (tokens[pos.i - 2].token === 'class' || tokens[pos.i - 2].token === 'enum') {
                declarationTokens.push(tokens[pos.i - 2]);
                declarationTokens.push(tokens[pos.i - 1]);
                continueDeclaration = true;
            } else if (pos.i >= 3 && tokens[pos.i - 3].token === '@' && tokens[pos.i - 2].token === 'interface') {
                declarationTokens.push(tokens[pos.i - 3]);
                declarationTokens.push(tokens[pos.i - 2]);
                declarationTokens.push(tokens[pos.i - 1]);
                var newVal = variables[token] || [];
                newVal.push(declarationTokens);
                variables[token] = newVal;
                continueDeclaration = false;
                declarationTokens = [];
            } else if (tokens[pos.i - 2].token === 'interface') {
                declarationTokens.push(tokens[pos.i - 2]);
                declarationTokens.push(tokens[pos.i - 1]);
                continueDeclaration = true;
            } else if (isModifier(tokens[pos.i - 2].token)) { if (!isModifier(tokens[pos.i - 1].token)) { continueDeclaration = true; } } else {}
        }
        if (token === '{' || token === '}' || token === '(' || token === ')' || token === ',' || token === ';' || token === 'class' || token === 'interface' || token === 'enum') { startDeclaration = true; } else if (JAVA_MODIFIERS.indexOf(token) > -1) { startDeclaration = true; } else if (token.trim() !== '') { startDeclaration = false; }
    });
    console.log(pos);
    console.log(cursor);
    console.log(currentTokenIndex);
    var tokensCount = tokens.length;
    var packageProcessed = false;
    var importsProcessed = false;
    var result = {};
    result.imports = [];
    result.additionalWords = [];
    for (var i = 0; i < tokensCount; i++) {
        var pair = tokens[i];
        if (pair.token.trim() === '') { continue; } else if (!packageProcessed && pair.token === 'package') {
            packageProcessed = true;
            var packageResult = processPackage(tokens, i);
            result.package = packageResult.packageName;
            i = packageResult.finalI;
            result.packageEndPos = tokens[i + 1].pos;
        } else if (pair.token === 'import') {
            console.log(pair);
            var packageResult = processImportLine(tokens, i);
            packageResult.importStmt.pos = pair.pos;
            result.imports.push(packageResult.importStmt);
            if (!packageResult.importStmt.line.endsWith('*')) { result.additionalWords.push(packageResult.importStmt.line.split(/[.]/).pop()); }
            i = packageResult.finalI;
        } else if (pair.type === 'variable' || pair.type === 'variable-3') {
            if (tokens[i + 1].type === 'variable' || tokens[i + 1].type === 'variable-3') {
                if (tokens[i + 2].token === '(') {
                    var newVal = variables[tokens[i + 1].token] || [];
                    if (typeof(newVal) === "function") { newVal = []; }
                    var declarationTokens1 = [];
                    for (var j = i; j < tokens.length; j++) { declarationTokens1.push(tokens[j]); if (tokens[j].token === ')') { break; } }
                    newVal.push(declarationTokens1);
                    variables[tokens[i + 1].token] = newVal;
                } else {
                    var newVal = variables[tokens[i + 1].token] || [];
                    newVal.push([tokens[i], tokens[i + 1]]);
                    variables[tokens[i + 1].token] = newVal;
                }
            }
            result.additionalWords.push(pair.token);
        }
    }
    result.currentExpression = findCurrentExpression(tokens, currentTokenIndex);
    result.variables = variables;
    console.log(result);
    return result;
}

function processPackage(tokens, i) {
    var package = '';
    while (++i < tokens.length) {
        var pair = tokens[i];
        console.log(pair);
        if (pair.token.trim() === '') { continue; }
        if (pair.type === 'variable' || pair.type === 'variable-3' || pair.type === 'def' || pair.token === '.') { package += pair.token; continue; }
        break;
    }
    return { packageName: package, finalI: i };
}

function processImportLine(tokens, i) {
    var importStmt = {};
    var importedClass = '';
    while (++i < tokens.length) { var pair = tokens[i]; if (pair.token.trim() === '') { continue; } else if (pair.type === 'variable' || pair.type === 'variable-3' || pair.type === 'def' || pair.token === '.' || pair.token === '*') { importedClass += pair.token; continue; } else if (pair.token === 'static') { importStmt.isStatic = true; } else { break; } }
    importStmt.line = importedClass;
    return { importStmt: importStmt, finalI: i };
}

function findCurrentExpression(tokens, currentTokenIndex) {
    var currentToken = tokens[currentTokenIndex];
    var expressionTokens = [];
    var parens = 0;
    var squareBrackets = 0;
    var curlyBraces = 0;
    var whitespace = false;
    for (var j = currentTokenIndex; j >= 0; j--) {
        var pair = tokens[j];
        if (pair.token.trim() === "") { whitespace = true; continue; }
        if (pair.token === '.' || pair.token === 'class' || pair.type === 'string') { expressionTokens.unshift(pair); } else if (pair.type === 'variable' || pair.type === 'variable-3') {
            if (whitespace) { break; }
            expressionTokens.unshift(pair);
        } else {
            console.log("breaking expression at : ");
            console.log(pair);
            break;
        }
        whitespace = false;
    }
    console.log(expressionTokens);
    return expressionTokens;
}

function completeShortcut(editor, self, data) { editor.replaceRange(data.expandedText, self.from, self.to); }

function insertImport(editor, self, data) {
    editor.replaceRange(data.text, self.from, self.to);
    editor.replaceRange('import ' + data.displayText.replace(/\$/g, '.') + ';\n', data.importPos || { line: 0, ch: 0 });
}

function hintFn(editor, options) {
    console.log("hintFn called");
    console.log(options);
    var cursor = editor.getCursor();
    console.log(cursor);
    var token = editor.getTokenAt(cursor);
    console.log(token);
    var result = parseJavaContents(editor, cursor);
    console.log(result);
    if (!result.currentExpression) { return createCompletionsList([], cursor, token); }
    if (result.currentExpression.length === 1) { var list = handleBeginingExpression(token, result); return createCompletionsList(list, cursor, token); } else if (result.currentExpression.length >= 2) { var list = handleLongerExpression(token, result); return createCompletionsList(list, cursor, token); }
    var allSuggestions = [];
    var list = allSuggestions.concat([]);
    return createCompletionsList(list, cursor, token);
}

function createCompletionsList(list, cursor, token) {
    console.log(list);
    console.log(cursor);
    console.log(token);
    if (token.string == '.') { return { list: list, from: { line: cursor.line, ch: token.end }, }; }
    return { list: list, from: { line: cursor.line, ch: token.start }, to: { line: cursor.line, ch: token.end }, };
}

function handleBeginingExpression(token, result) {
    var keywordSuggestions = keywordsTrie.find(token.string) || [];
    var additionalWordsCompletions = getAdditionalWordsCompletions(token, result);
    var importPos = result.packageEndPos || { ch: 0, line: 0 };
    if (result.imports && result.imports.length > 0) { importPos = result.imports[0].pos; }
    var classesCompletions = getClassesCompletions(token, result.imports, importPos);
    var shortcutCompletions = shortcutsTrie.find(token.string) || [];
    return dedupeArray(keywordSuggestions.concat(additionalWordsCompletions, classesCompletions, shortcutCompletions));
}

function handleLongerExpression(token, result) {
    var expr = getCurrentExprWithoutPartialToken(result);
    console.log('longer expression');
    var possibleDeclarations = result.variables[expr[0].token];
    console.log(possibleDeclarations);
    var currentTokenIndex = expr[0].index;
    var isStatic = false;
    var classFullName = '';
    if (expr[0].type === 'string') {
        isStatic = false;
        classFullName = 'java.lang.String';
    } else if (possibleDeclarations && possibleDeclarations.length > 0) {
        var type = possibleDeclarations[0][0].token;
        for (var i = 1; i < possibleDeclarations.length && possibleDeclarations[i][0].index < currentTokenIndex; i++) { type = possibleDeclarations[i][0].token; };
        if (classFullNameMap[type]) {
            isStatic = false;
            classFullName = classFullNameMap[type].fullName;
        } else if (classFullNameMap[expr[0].token] && classFullNameMap[expr[0].token].fullName) {
            classFullName = classFullNameMap[expr[0].token].fullName;
            isStatic = true;
        }
    } else if (classFullNameMap[expr[0].token] && classFullNameMap[expr[0].token].fullName) {
        classFullName = classFullNameMap[expr[0].token].fullName;
        isStatic = true;
    }
    console.log(classFullName);
    console.log(isStatic);
    for (var i = 2; expr[1].token === '.' && i < expr.length; i++) {
        var exprElement = expr[i];
        if (exprElement.token === '.') { continue; }
        var classDetail = classDetails[classFullName];
        if (expr[i + 1].token === '.') {
            var elements = isStatic ? classDetail.staticFields : classDetail.nonStaticFields;
            console.log('selectedElements: ');
            console.log(elements);
            if (isStatic && exprElement.token === 'class') {
                isStatic = false;
                classFullName = 'java.lang.Class';
            }
            if (elements) {
                for (var property in elements) {
                    console.log('checking property: ' + property);
                    if (elements.hasOwnProperty(property) && property === exprElement.token) {
                        isStatic = false;
                        classFullName = elements[property].fieldType;
                        console.log(elements[property]);
                        console.log(classFullName);
                        break;
                    }
                }
            }
        }
    }
    console.log(classFullName);
    console.log(isStatic);
    var classDetail = classDetails[classFullName];
    console.log("classDetail");
    console.log(classDetail);
    if (!classDetail) { return []; }
    var fields;
    var methods;
    if (isStatic) {
        fields = classDetail.staticFields || [];
        methods = classDetail.staticMethods || [];
    } else {
        fields = classDetail.nonStaticFields || [];
        methods = classDetail.nonStaticMethods || [];
    }
    var list = [];
    console.log(fields);
    for (var property in fields) { if (fields.hasOwnProperty(property) && (token.string === '.' || property.startsWith(token.string))) { list.push({ text: property }); } }
    for (var property in methods) {
        if (methods.hasOwnProperty(property) && (token.string === '.' || property.startsWith(token.string))) {
            var argc = methods[property].argc;
            var name = property + '(';
            for (var i = 0; i < methods[property].argc; i++) { name += ((i >= 1) ? ', ' : '') + 'arg' + (i + 1); }
            name += ')';
            list.push({ text: name });
        }
    }
    if (isStatic) { list.push({ text: 'class' }); }
    console.log(list);
    return list;
}

function getCurrentExprWithoutPartialToken(result) {
    var expr = result.currentExpression;
    if (expr[expr.length - 1].token !== '.' && expr[expr.length - 2].token === '.') { expr.pop(); }
    console.log('Expression');
    console.log(expr);
    return expr;
}

function getAdditionalWordsCompletions(token, result) {
    if (result.additionalWords.indexOf(token.string) >= 0) { result.additionalWords.splice(result.additionalWords.indexOf(token.string), 1); }
    var completions = [];
    for (var i = result.additionalWords.length - 1; i >= 0; i--) { var word = result.additionalWords[i]; if (word.startsWith(token.string)) { completions.push({ text: word }); } };
    return completions;
}

function getClassesCompletions(token, imports, importPos) {
    var classesFromTrie = classesTrie.find(token.string) || [];
    var list = [];
    for (var i = classesFromTrie.length - 1; i >= 0; i--) {
        var classFromTrie = classesFromTrie[i];
        var imported = false;
        var isJavaLang = /^java\.lang\.([^.])+$/.test(classFromTrie.fullName);
        for (var j = imports.length - 1; !isJavaLang && j >= 0; j--) { var importStmt = imports[j]; if (importStmt.line === classFromTrie.fullName || isWildCardMatch(importStmt.line, classFromTrie.fullName)) { imported = true; break; } }
        if (imported || isJavaLang) { list.push({ text: classFromTrie.name, displayText: classFromTrie.fullName, importPos: importPos }); } else { list.push({ text: classFromTrie.name, displayText: classFromTrie.fullName, hint: insertImport, importPos: importPos }); }
    };
    return list;
}

function isWildCardMatch(importLine, fullClassName) {
    if (!importLine.endsWith('*')) { return false; }
    var packagePrefix = importLine.substring(0, importLine.length - 1);
    if (!fullClassName.startsWith(packagePrefix)) { return false; }
    var className = fullClassName.substring(importLine.length - 1);
    console.log(packagePrefix);
    console.log(className);
    return className.indexOf('.') === -1;
}

function loadJavaScript(url) {
    var elm = document.createElement("script");
    elm.setAttribute("type", "text/javascript");
    elm.setAttribute("async", "");
    elm.src = url;
    document.body.appendChild(elm);
}

function dedupeArray(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (_.isEqual(a[i], a[j]))
                a.splice(j--, 1);
        }
    }
    return a;
};
loadJavaScript("/codemirror/trie.min.js");
loadJavaScript("/codemirror/classNames.js");
loadJavaScript("/codemirror/classDetails.js");
CodeMirror.registerHelper("hint", "text/x-java", hintFn);