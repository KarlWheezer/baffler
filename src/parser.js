"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const fs_1 = __importDefault(require("fs"));
const lexer_1 = require("./lexer");
class Parser {
    constructor(lexer) {
        this.errors = 0;
        this.lexer = lexer;
        this.tokens = this.lexer.lex();
        this.index = 0;
        this.statements = [];
        this.prev = this.tokens[this.index];
        this.cur = this.tokens[this.index];
        this.next = this.tokens[this.index + 1];
    }
    go(steps = 1) {
        this.index += steps;
        this.prev = this.tokens[this.index - 1];
        this.cur = this.tokens[this.index];
        this.next = this.tokens[this.index + 1];
    }
    error(value, types, cur = this.cur, top = `Unexpected token`) {
        let i = 0;
        let str = "";
        while (i < cur.col - 1) {
            i++;
            str += " ";
        }
        str += "\x1b[31m^";
        i = 0;
        while (i < cur.len - 1) {
            i++;
            str += "~";
        }
        str += "\x1b[0m";
        let error = [`\x1b[31mError\x1b[0m: ${top} ---> \x1b[4m${this.lexer.filename}\x1b[0m[${cur.line}:${cur.col}]`,
            `\x1b[32m${cur.line} | \x1b[0m ${this.lexer.lines[cur.line - 1]}`,
            `\x1b[32m${String(cur.line).replace(/^[0-9]/, " ")} | \x1b[0m ${str} Unexpected ${this.cur.toString()} token wanted a token`];
        let str_ = [];
        types.forEach(type => { str_.push(lexer_1.token_type[type]); });
        error[error.length - 1] += ` matching [ ${str_.join(", ")} ]`;
        if (value !== null)
            error[error.length - 1] += ` with value ${value}`;
        console.log(error.join("\n"));
        this.errors += 1;
    }
    eat(value, ...types) {
        if (this.index >= this.tokens.length) {
            this.error(value, types, this.prev, 'Unexpected end of file');
            process.exit(1);
        }
        if (value === null)
            for (let i = 0; i < types.length; i++) {
                if (this.cur.type === types[i]) {
                    this.go();
                    return this.prev;
                }
            }
        else
            for (let i = 0; i < types.length; i++) {
                if (this.cur.type === types[i] && this.cur.value === value) {
                    this.go();
                    return this.prev;
                }
            }
        this.error(value, types);
        this.go();
        return (this.prev);
    }
    parse_assignment(v) {
        let start = this.eat(v, lexer_1.token_type.keyword);
        let name = this.eat(null, lexer_1.token_type.identifier);
        this.eat("=", lexer_1.token_type.assign);
        let value = this.eat(null, lexer_1.token_type.identifier, lexer_1.token_type.string, lexer_1.token_type.number);
        let end = this.eat(";", lexer_1.token_type.semi_colon);
        return { type: v + "-assignment", name: name, value: value, line: start.line, col: start.col, len: end.col - name.col };
    }
    parse_block() {
        let statements = [];
        this.eat("[", lexer_1.token_type.left_brace);
        let body = [];
        while (true) {
            if (this.index >= this.tokens.length - 1) {
                this.error(null, [], this.prev, `Unexpected end of file`);
                process.exit(1);
            }
            if (this.cur.value == "]")
                break;
            body.push(this.parse_statement());
        }
        this.eat("]", lexer_1.token_type.right_brace);
        return body;
    }
    parse_function_define() {
        let start = this.eat("fun", lexer_1.token_type.keyword);
        let name = this.eat(null, lexer_1.token_type.identifier);
        let args = this.parse_args();
        this.eat("=>", lexer_1.token_type.arrow);
        let body = this.parse_block();
        return { type: 'fun define', name: name, args: args, statements: body, start: { col: start.col, line: start.line }, end: { col: this.prev.col, line: this.prev.line } };
    }
    parse_condition() {
        let left = this.eat(null, lexer_1.token_type.identifier, lexer_1.token_type.number, lexer_1.token_type.string);
        let operatoer = this.eat(null, lexer_1.token_type.compare);
        let right = this.eat(null, lexer_1.token_type.identifier, lexer_1.token_type.number, lexer_1.token_type.string);
        return { type: "compare", left, right, operatoer };
    }
    parse_if_statement() {
        this.eat("if", lexer_1.token_type.keyword);
        let start = "[";
        let compare = this.parse_condition();
        let body;
        let else_body = null;
        if (this.cur.value === start) {
            body = this.parse_block();
        }
        else {
            body = this.parse_statement();
        }
        if (this.cur.value === "else" && this.cur.type === lexer_1.token_type.keyword) {
            this.eat("else", lexer_1.token_type.keyword);
            if (this.cur.value === start) {
                else_body = this.parse_block();
            }
            else {
                else_body = this.parse_statement();
            }
            return { type: 'if', condition: compare, if: body, else: else_body, line: compare.left.line, col: compare.left.col };
        }
        return { type: 'if', condition: compare, if: body, line: compare.left.line, col: compare.left.col };
    }
    parse_args() {
        let array = [];
        this.eat("(", lexer_1.token_type.left_paren);
        while (true) {
            if (this.cur.type === lexer_1.token_type.identifier ||
                this.cur.type === lexer_1.token_type.string ||
                this.cur.type === lexer_1.token_type.number) {
                array.push(this.cur);
                this.go();
            }
            if (this.cur.value === ",")
                this.go();
            if (this.cur.value === ")")
                break;
        }
        this.eat(")", lexer_1.token_type.right_paren);
        return array;
    }
    parse_function_call() {
        let name = this.eat(null, lexer_1.token_type.identifier);
        let args = this.parse_args();
        this.eat(";", lexer_1.token_type.semi_colon);
        return { type: 'fun call', name: name, args: args, line: name.line, col: name.col, len: this.prev.col - name.col };
    }
    parse_statement() {
        switch (true) {
            case this.cur.value === "set" || this.cur.value === "var" && this.cur.type === lexer_1.token_type.keyword:
                return this.parse_assignment(this.cur.value);
            case this.cur.type === lexer_1.token_type.identifier && this.next.type === lexer_1.token_type.left_paren:
                return this.parse_function_call();
            case this.cur.type === lexer_1.token_type.keyword && this.cur.value === "fun":
                return this.parse_function_define();
            case this.cur.value === "if" && this.cur.type === lexer_1.token_type.keyword:
                return this.parse_if_statement();
            case this.cur.value === '\0': return "EOF";
            default: return { type: "unknown", value: this.cur.value, line: this.cur.line, col: this.cur.col, len: this.cur.len };
        }
    }
    parse() {
        while (this.index < this.tokens.length - 1) {
            let statement = this.parse_statement();
            if (statement === "EOF")
                break;
            this.statements.push(statement);
        }
        if (this.errors == 0) {
            fs_1.default.writeFileSync(this.lexer.filename + ".json", JSON.stringify(this.statements, null, 4));
        }
        else {
            console.log(`\n\x1b[31mCompilation failed due to previous errors.\x1b[0m`);
        }
    }
}
exports.Parser = Parser;
