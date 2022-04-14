"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = exports.token = exports.token_type = void 0;
const fs_1 = __importDefault(require("fs"));
var token_type;
(function (token_type) {
    token_type[token_type["start"] = 0] = "start";
    token_type[token_type["identifier"] = 1] = "identifier";
    token_type[token_type["keyword"] = 2] = "keyword";
    token_type[token_type["string"] = 3] = "string";
    token_type[token_type["number"] = 4] = "number";
    token_type[token_type["left_brace"] = 5] = "left_brace";
    token_type[token_type["right_brace"] = 6] = "right_brace";
    token_type[token_type["left_paren"] = 7] = "left_paren";
    token_type[token_type["right_paren"] = 8] = "right_paren";
    token_type[token_type["assign"] = 9] = "assign";
    token_type[token_type["arrow"] = 10] = "arrow";
    token_type[token_type["dot"] = 11] = "dot";
    token_type[token_type["semi_colon"] = 12] = "semi_colon";
    token_type[token_type["comma"] = 13] = "comma";
    token_type[token_type["undefined"] = 14] = "undefined";
    token_type[token_type["EOF"] = 15] = "EOF";
    token_type[token_type["compare"] = 16] = "compare";
})(token_type = exports.token_type || (exports.token_type = {}));
class token {
    constructor(type, value, line, col) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.col = col;
        this.len = this.value.length;
    }
    new() { return { type: this.type, value: this.value, pos: { line: this.line, col: this.col }, len: this.len }; }
    toString() { return `${token_type[this.type].replace("_", " ")}`; }
}
exports.token = token;
class Lexer {
    constructor(filename) {
        this.index = 0;
        this.line = 1;
        this.col = 1;
        this.filename = filename;
        let content = fs_1.default.readFileSync(this.filename).toString();
        this.tokens = [];
        this.lines = content.split("\n");
        this.chars = content.split("");
        this.cur = this.chars[this.index];
    }
    add(type, value, col) {
        const tok = new token(type, value, this.line, col);
        this.tokens.push(tok);
    }
    next(steps = 1) {
        this.index += steps;
        this.col += steps;
        this.cur = this.chars[this.index];
        if (this.index >= this.chars.length)
            this.cur = '\0';
        return;
    }
    tokenize() {
        let col = this.col;
        if (this.cur.match(/[a-zA-Z_]/)) {
            let buffer = "";
            while (this.cur.match(/[a-zA-Z_0-9]/)) {
                buffer += this.cur;
                this.next();
            }
            switch (buffer) {
                case "set":
                case "var":
                case "if":
                case "else":
                case "fun":
                    this.add(token_type.keyword, buffer, col);
                    break;
                default:
                    this.add(token_type.identifier, buffer, col);
                    break;
            }
        }
        else if (this.cur.match(/[0-9]/)) {
            let buffer = "";
            while (this.cur.match(/[0-9]|\./)) {
                buffer += this.cur;
                this.next();
            }
            this.add(token_type.number, buffer, col);
        }
        else if (this.cur === '"') {
            this.next();
            let buffer = "";
            while (this.cur !== '"') {
                if (this.cur === '\\') {
                    this.next();
                    buffer += this.cur;
                }
                buffer += this.cur;
                this.next();
            }
            this.next();
            this.add(token_type.string, buffer, col + 1);
        }
        else if (this.cur === '\0') {
            return "EOF";
        }
        else
            switch (this.cur) {
                case "[":
                    this.add(token_type.left_brace, this.cur, col);
                    this.next();
                    break;
                case "]":
                    this.add(token_type.right_brace, this.cur, col);
                    this.next();
                    break;
                case "(":
                    this.add(token_type.left_paren, this.cur, col);
                    this.next();
                    break;
                case ")":
                    this.add(token_type.right_paren, this.cur, col);
                    this.next();
                    break;
                case ";":
                    this.add(token_type.semi_colon, this.cur, col);
                    this.next();
                    break;
                case ",":
                    this.add(token_type.comma, this.cur, col);
                    this.next();
                    break;
                case ">":
                case "<": {
                    let bufr = this.cur;
                    if (this.chars[this.index + 1] === '=')
                        bufr += this.cur;
                    this.next();
                    this.add(token_type.compare, bufr, col);
                    break;
                }
                case '=': {
                    if (this.chars[this.index + 1] === '>') {
                        this.add(token_type.arrow, "=>", col);
                        this.next(2);
                        break;
                    }
                    if (this.chars[this.index + 1] === '=') {
                        this.add(token_type.compare, "==", col);
                        this.next(2);
                        break;
                    }
                    this.add(token_type.assign, "=", col);
                }
                case ' ':
                    this.next();
                    break;
                case '\n':
                    this.next();
                    this.col = 1;
                    this.line += 1;
                    break;
                default:
                    console.log(JSON.stringify(this.cur));
                    this.next();
                    break;
            }
    }
    lex() {
        let chars = [];
        for (let i of this.chars) {
            if (i !== '\r')
                chars.push(i);
        }
        this.chars = chars;
        let col = 0;
        while (true) {
            let addedToken = this.tokenize();
            if (addedToken === "EOF")
                break;
            col = this.tokens[this.tokens.length - 1].col;
        }
        this.add(token_type.EOF, '\0', this.lines[this.lines.length - 1].length + 1);
        return this.tokens;
    }
}
exports.Lexer = Lexer;
