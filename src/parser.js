"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
class Parser {
    constructor(lexer) {
        this.index = 0;
        this.lexer = lexer;
        this.tokens = this.lexer.tokenize();
        this.statements = [];
        this.prev = this.tokens[this.index];
        this.cur = this.tokens[this.index];
        this.next = this.tokens[this.index + 1];
    }
    advance() {
        this.index++;
        this.prev = this.tokens[this.index - 1];
        this.cur = this.tokens[this.index];
        this.next = this.tokens[this.index + 1];
    }
    eat(value = null, ...type) {
        if (this.index >= this.tokens.length) {
            let i = 0;
            let buffer = "";
            while (i < this.prev.col - 1) {
                i++;
                buffer += " ";
            }
            buffer += "^";
            i = 0;
            while (i < this.prev.len - 1) {
                i++;
                buffer += "~";
            }
            let EOFmsg = [
                `\x1b[31mError[UET]\x1b[0m: Unexpected End of File ---> \x1b[4m${this.lexer.file_name}\x1b[0m[${this.prev.line}:${this.prev.col + 1}]`,
                `\x1b[36m${this.prev.line} |\x1b[0m ${this.lexer.lines[this.prev.line - 1]}`,
                `${String(this.prev.line).replace(/^[0-9]*/, " ")} \x1b[36m|\x1b[0m ${buffer} Unexpected end of input, wanted a token that matches [ ${type.join(", ")} ]`
            ];
            if (value !== null)
                EOFmsg[EOFmsg.length - 1] += ` with value '${value}'.`;
            console.log(EOFmsg.join("\n"));
            process.exit(1);
        }
        if (value === null) {
            for (let i = 0; i < type.length; i++) {
                if (this.cur.type == type[i]) {
                    this.advance();
                    return true;
                }
            }
        }
        if (value !== null) {
            for (let i = 0; i < type.length; i++) {
                if (this.cur.type == type[i] && this.cur.value == value) {
                    this.advance();
                    return true;
                }
            }
        }
        let i = 0;
        let buffer = "";
        while (i < this.cur.col - 1) {
            i++;
            buffer += " ";
        }
        buffer += "^";
        i = 0;
        while (i < this.cur.len - 1) {
            i++;
            buffer += "~";
        }
        const msg = [
            `\x1b[31mError[UET]\x1b[0m: Unexpected token ---> \x1b[4m${this.lexer.file_name}\x1b[0m[${this.cur.line}:${this.cur.col}]`,
            `\x1b[36m${this.cur.line} |\x1b[0m ${this.lexer.lines[this.cur.line - 1]}`,
            `${String(this.cur.line).replace(/^[0-9]*/, " ")} \x1b[36m|\x1b[0m ${buffer} Unexpected '${this.cur.type}' token, wanted a token that matches [ ${type.join(", ")} ]`
        ];
        if (value !== null)
            msg[msg.length - 1] += ` with value '${value}'.`;
        console.log(msg.join("\n"));
        this.advance();
        return false;
    }
}
exports.Parser = Parser;
