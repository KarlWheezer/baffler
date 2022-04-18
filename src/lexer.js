"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = exports.token = exports.t = void 0;
const fs_1 = __importDefault(require("fs"));
var t;
(function (t) {
    t[t["identifier"] = 0] = "identifier";
    t[t["string"] = 1] = "string";
    t[t["keyword"] = 2] = "keyword";
    t[t["number"] = 3] = "number";
    t[t["operator"] = 4] = "operator";
    t[t["compare"] = 5] = "compare";
    t[t["l_paren"] = 6] = "l_paren";
    t[t["r_paren"] = 7] = "r_paren";
    t[t["l_brace"] = 8] = "l_brace";
    t[t["r_brace"] = 9] = "r_brace";
    t[t["equals"] = 10] = "equals";
    t[t["arrow"] = 11] = "arrow";
    t[t["semi_colon"] = 12] = "semi_colon";
    t[t["comma"] = 13] = "comma";
    t[t["EOF"] = 14] = "EOF";
    t[t["not_important"] = 15] = "not_important";
})(t = exports.t || (exports.t = {}));
class token {
    constructor(type, value, line, col) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.col = col;
        this.len = value.length;
    }
    toString() {
        switch (this.type) {
            case t.identifier: return "identifier";
            case t.string: return "string";
            case t.keyword: return "keyword";
            case t.number: return "number";
            case t.operator: return "operator";
            case t.compare: return "compare";
            case t.l_paren: return "left paren";
            case t.r_paren: return "right paren";
            case t.l_brace: return "left brace";
            case t.r_brace: return "right brace";
            case t.equals: return "equals";
            case t.arrow: return "arrow";
            case t.semi_colon: return "semi colon";
            case t.comma: return "comma";
            case t.EOF: return "End of file";
            case t.not_important: return "not important";
        }
    }
}
exports.token = token;
const isalnum = (char) => { return char.match(/[a-zA-Z_0-9]/) != null && char.match(/[a-zA-Z_0-9]/) != undefined; };
class Lexer {
    constructor(filename) {
        this.keywords = ["set", "var", "fun", "if", "else", "return", "import"];
        this.filename = filename;
        this.index = 0;
        this.content = fs_1.default.readFileSync(filename).toString() + '\0';
        this.cur = this.content[this.index];
        this.line = 1;
        this.col = 1;
        this.tokens = [];
    }
    add(type, value, col) { this.tokens.push(new token(type, value, this.line, col)); }
    next(steps = 1) {
        this.index += steps;
        this.col += steps;
        if (this.index >= this.content.length) {
            this.cur = '\0';
            return;
        }
        this.cur = this.content[this.index];
        return;
    }
    tokenize() {
        let col = this.col;
        if (this.cur.match(/[a-zA-Z_]/)) {
            let buffer = "";
            while (isalnum(this.cur)) {
                buffer += this.cur;
                this.next();
            }
            if (this.keywords.includes(buffer)) {
                this.add(t.keyword, buffer, col);
            }
            else {
                this.add(t.identifier, buffer, col);
            }
            ;
        }
        else if (this.cur.match(/[0-9]/)) {
            let buffer = "";
            while (this.cur.match(/[0-9]|\./)) {
                buffer += this.cur;
                this.next();
            }
            this.add(t.number, buffer, col);
        }
        else if (this.cur == '"') {
            this.next();
            let buffer = "";
            while (this.cur != '"') {
                if (this.cur == '\\') {
                    buffer += this.cur;
                    this.next();
                }
                if (this.index >= this.content.length) {
                    console.log(`Unexpected end of file without string terminating characture '\"' ---> ${this.filename}[${this.line}:${col}]`);
                }
                buffer += this.cur;
                this.next();
            }
            this.next();
            this.add(t.string, buffer, col);
        }
        else {
            switch (this.cur) {
                case '[':
                    this.add(t.l_brace, this.cur, col);
                    this.next();
                    break;
                case ']':
                    this.add(t.r_brace, this.cur, col);
                    this.next();
                    break;
                case '(':
                    this.add(t.l_paren, this.cur, col);
                    this.next();
                    break;
                case ')':
                    this.add(t.r_paren, this.cur, col);
                    this.next();
                    break;
                case ';':
                    this.add(t.semi_colon, this.cur, col);
                    this.next();
                    break;
                case ',':
                    this.add(t.comma, this.cur, col);
                    this.next();
                    break;
                case '-':
                case '+':
                case '/':
                case '*':
                    this.add(t.operator, this.cur, col);
                    this.next();
                    break;
                case ' ':
                    this.next();
                    break;
                case '\n':
                    this.next();
                    this.col = 1;
                    this.line += 1;
                    break;
                case '\r':
                    this.next();
                    this.col -= 1;
                    break;
                case '=':
                    if (this.content[this.index + 1] == '>') {
                        this.next(2);
                        this.add(t.arrow, "=>", col);
                        break;
                    }
                    else if (this.content[this.index + 1] == '=') {
                        this.next(2);
                        this.add(t.compare, "==", col);
                        break;
                    }
                    else {
                        this.next();
                        this.add(t.equals, "=", col);
                        break;
                    }
                case '\0':
                    this.add(t.EOF, '\0', col);
                    return t.EOF;
                default:
                    console.log(`Unknown characture ${JSON.stringify(this.cur)} ---> ${this.filename}[${this.line}:${col}]`);
                    this.next();
                    break;
            }
        }
    }
    lex() {
        while (true) {
            let token = this.tokenize();
            if (token == t.EOF)
                break;
        }
        return this.tokens;
    }
}
exports.Lexer = Lexer;
