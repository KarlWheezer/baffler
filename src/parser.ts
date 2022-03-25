import * as fs from 'fs';
import { Lexer, token } from "./lexer";

export class Parser {
    lexer: Lexer; index: number; tokens: token[];
    prev: token; cur: token; next: token; 
    statements: any[];
    constructor(lexer: Lexer) {
        this.lexer = lexer; this.statements = [];
        this.index = 0; this.tokens = lexer.lex();
        this.prev = this.tokens[this.index];
        this.cur  = this.tokens[this.index];
        this.next = this.tokens[this.index + 1];
    }
    advance() { this.index += 1;
        this.prev = this.tokens[this.index - 1];
        this.cur  = this.tokens[this.index];
        this.next = this.tokens[this.index + 1];
    }
    eat(value: string | null, ...types: string[]) {
        if (this.index > this.tokens.length) {
            let buffer = ""; let k = 0; while (k < this.prev.col + 1) { buffer += " "; k ++ }
            buffer += '^'; console.log([
                `\x1b[31mError[EOF]\x1b[0m: Unexpected end of file ---> \x1b[4m${this.lexer.file_name}\x1b[0m[${this.prev.line}:${this.prev.col + 1}]`,
                `${this.prev.line} | ${this.lexer.lines[this.prev.line - 1]}`,
                `${String(this.prev.line).replace(/^[0-9]*/, " ")} | ${buffer} Unexpected end of input, wnated a token that matches [ ${types} ]`
            ].join("\n"));
        }
        
        if (value === null) { for (let i=0; i < types.length; i ++) { if (this.cur.type == types[i]) { this.advance(); return true; } } }
        if (value !== null) { for (let i=0; i < types.length; i ++) { if (this.cur.type == types[i] && this.cur.value == value) { this.advance(); return true; } } }

        let buffer = ""; let k = 0; while (k < this.cur.col - 1) { k ++; buffer += " " } buffer += "^";
        k = 0; while (k < this.cur.len - 1) { k ++; buffer += "~" }
        let msg = [
            `\x1b[31mError[EOF]\x1b[0m: Unexpected token ---> \x1b[4m${this.lexer.file_name}\x1b[0m[${this.cur.line}:${this.cur.col}]`,
            `${this.cur.line} | ${this.lexer.lines[this.cur.line - 1]}`,
            `${String(this.prev.line).replace(/^[0-9]*/, " ")} | ${buffer} Unexpected '${this.cur.type}' token, wanted a token that matches [ ${types.join(", ")} ]`
        ]
        if (value !== null) { msg[msg.length - 1] += ` with value '${value}'` }
        console.log(msg.join("\n"))
    }
    parseAssign(type: string) {
        let current = { type: `${type}-assign`, name: {}, data: "", value: {}, line: this.cur.line, col: this.cur.col }
        this.eat(type, "keyword");
        this.eat(null, "identifier"); current.name = this.prev;
        this.eat("=", "assign");
        this.eat(null, "identifier", "string", "number"); current.value = this.prev;
        current.data = this.prev.type; this.eat(";", "semi");

        return current;
    }
    parseFunCall() {
        let current = { type: "fun call", name: {}, args: [{}], line: this.cur.line, col: this.cur.col }
        this.eat(null, "identifier"); current.name = this.prev;
        this.eat("(", "left paren");
        current.args = this.parseArgs();
        this.eat(")", "right paren");
        this.eat(";", "semi");

        return current;
    }
    parseBlock() {
        this.eat("[", "left brace");
        let body: any[] = [];
        while (true) {
            if (this.index >= this.tokens.length - 1) {
                console.log(
                    `Unexpected End of input was expecting a closing body cahracture "]" ---> ${this.lexer.file_name}[${this.cur.line}:${this.cur.col}]`
                ); process.exit(1);
            }
            if (this.cur.value == "]") break;
            body.push(this.parseStatement());
        }
        this.advance();
        return body;
    }
    parseFunDef() {
        let current = { type: "fun def", name: {}, args: [{}], statements: [""], line: this.cur.line, col: this.cur.col }
        this.eat("fun", "keyword");
        this.eat(null, "identifier"); current.name = this.prev;
        this.eat("(", "left paren");
        current.args = this.parseArgs();
        this.eat(")", "right paren");
        this.eat("=>", "arrow");
        current.statements = this.parseBlock();
        return current;
    }
    parseArgs() {
        let arr: any[] = [];
        while (true) {
            if (this.index >= this.tokens.length - 1) {
                console.log(
                    `\x1b[31mError\x1b[0m: Unexpected End of FIle, was expectinga ")" characture ---> \x1b[4m${this.lexer.file_name}\x1b[0m[${this.cur.line}:${this.cur.col}]`
                ); process.exit(1);
            }
            if (this.cur.value == ")") break; if (this.cur.value == ",")   this.advance();
            if (this.cur.value == "(") { this.advance(); arr.push(this.parseArgs()); this.advance(); }
            if (this.cur.type == "identifier" || this.cur.type == "string" || this.cur.type == "number") {
                this.eat(null, "identifier", "string", "number"); arr.push(this.prev); }
        } return arr;
    }
    parseStatement() {
        if (this.cur.value == "var" || this.cur.value == "set" && this.cur.type == "keyword") {
            return this.parseAssign(this.cur.value);
        } else if (this.cur.type == "identifier" && this.next.value == "(") {
            return this.parseFunCall();
        } else if (this.cur.type == "keyword" && this.cur.value == "fun") {
            return this.parseFunDef();
        } else {
            console.log(this.cur); this.advance();
        }
    }
    parse() {
        while (true) {
            if (this.cur.type == "EOF" || this.index >= this.tokens.length ) break;
            this.statements.push(this.parseStatement());
        }
        fs.writeFileSync(this.lexer.file_name + ".json", JSON.stringify(this.statements, null, 4));
    }
}