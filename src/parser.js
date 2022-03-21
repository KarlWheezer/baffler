"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const fs_1 = require("fs");
class Parser {
    constructor(lexer) {
        this.lexer = lexer;
        this.index = 0;
        this.tokens = this.lexer.tokenize();
        this.prev = { type: "null", value: "\0", line: 0, col: 0, len: 0 };
        this.cur = this.tokens[this.index];
        this.next = this.tokens[this.index + 1];
        this.statements = [];
    }
    advance(steps = 1) {
        this.prev = this.cur;
        this.index += steps;
        this.cur = this.tokens[this.index];
        this.next = this.tokens[this.index + 1];
    }
    eatLiteral() {
        let lits = ["identifier", "string", "imbeded string", "number"];
        for (var i = 0; i < lits.length; i++) {
            if (this.cur.type == lits[i]) {
                this.advance();
                return true;
            }
        }
        let k = 0;
        let bufr = "";
        while (k < this.cur.col - 1) {
            k++;
            bufr += " ";
        }
        ;
        bufr += "^";
        k = 0;
        while (k < this.cur.len - 1) {
            bufr += "~";
            k++;
        }
        let msg = [
            `Error [P0]: Unexpected token ---> ${this.lexer.file_name}[${this.cur.line}:${this.cur.col}]`,
            `${this.cur.line} | ${this.lexer.lines[this.cur.line - 1]}`,
            `${String(this.cur.line).replace(/^[0-9]*/, " ")} | ${bufr} Unexpected { type: '${this.cur.type}', value: '${this.cur.value}' }, wanted a literal`,
            `${String(this.cur.line).replace(/^[0-9]*/, " ")} | literal -> string, identifier, number.`
        ].join("\n");
        console.log(msg);
        this.advance();
        return false;
    }
    eat(type = "identifier", value = undefined) {
        if (value === undefined) {
            if (this.cur.type === type) {
                this.advance();
                return true;
            }
        }
        else if (value !== undefined) {
            if (this.cur.type === type && this.cur.value === value) {
                this.advance();
                return true;
            }
        }
        let k = 0;
        let bufr = "";
        while (k < this.cur.col - 1) {
            k++;
            bufr += " ";
        }
        ;
        bufr += "^";
        k = 0;
        while (k < this.cur.len - 1) {
            bufr += "~";
            k++;
        }
        let msg = [
            `Error [P0]: Unexpected token ---> ${this.lexer.file_name}[${this.cur.line}:${this.cur.col}]`,
            `${this.cur.line} | ${this.lexer.lines[this.cur.line - 1]}`,
            `${String(this.cur.line).replace(/^[0-9]*/, " ")} | ${bufr} Unexpected { type: '${this.cur.type}', value: '${this.cur.value}' }, wanted a { type: '${type}', value: '${value}' }.`,
        ].join("\n");
        console.log(msg);
        this.advance();
        return false;
    }
    typeError(got, expected) {
        let k = 0;
        let bufr = "";
        while (k < this.cur.col - 1) {
            k++;
            bufr += " ";
        }
        ;
        bufr += "^";
        k = 0;
        while (k < this.cur.len - 1) {
            bufr += "~";
            k++;
        }
        let msg = [
            `Error [P0]: Mismatched types ---> ${this.lexer.file_name}[${this.cur.line}:${this.cur.col}]`,
            `${this.cur.line} | ${this.lexer.lines[this.cur.line - 1]}`,
            `${String(this.cur.line).replace(/^[0-9]*/, " ")} | ${bufr} Missmatched types: got ${got}, but was expecting an ${expected}`
        ].join("\n");
        console.error(msg);
        process.exit(1);
    }
    parse() {
        while (this.index < this.tokens.length) {
            if (this.cur.type == "keyword" && this.cur.value == "set") {
                let cs = { type: "const-assignment", name: {}, data_type: { value: "" }, value: { type: "" }, line: this.cur.line, col: this.cur.col, len: 0 };
                this.eat("keyword", "set");
                this.eat("identifier");
                cs.name = this.prev;
                this.eat("colon", ":");
                this.eat("data type");
                cs.data_type = this.prev;
                this.eat("assign", "=");
                this.eatLiteral();
                cs.value = this.prev;
                this.eat("semi colon", ";");
                if (cs.data_type.value !== cs.value.type)
                    this.typeError(cs.value.type, cs.data_type.value);
                this.statements.push(cs);
            }
            else if (this.cur.type == "keyword" && this.cur.value == "var") {
                let cs = { type: "var-assignment", name: {}, data_type: { value: "" }, value: { type: "" }, line: this.cur.line, col: this.cur.col, len: 0 };
                this.eat("keyword", "var");
                this.eat("identifier");
                cs.name = this.prev;
                this.eat("colon", ":");
                this.eat("data type");
                cs.data_type = this.prev;
                this.eat("assign", "=");
                this.eatLiteral();
                cs.value = this.prev;
                this.eat("semi colon", ";");
                if (cs.data_type.value !== cs.value.type) {
                    this.typeError(cs.value.type, cs.data_type.value);
                }
                this.statements.push(cs);
            }
        }
        (0, fs_1.writeFileSync)(this.lexer.file_name + ".json", JSON.stringify(this.statements, null, 4));
    }
}
exports.Parser = Parser;
