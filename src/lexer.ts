import * as fs from 'fs';

export type token = {
    type:  string,
    value: string,
    line:  number,
    col:   number,
    len:   number
}
export class Lexer {
    file_name: string; lines: string[]; chars: string[]; 
    tokens: token[]; index: number; cur: string;
    line: number; col: number;
    constructor(file_name: string) {
        this.file_name = file_name; this.index = 0; this.tokens = [];
        let code = fs.readFileSync(this.file_name).toString().replace("\r", "");
        this.lines = code.split("\n"); this.chars = code.split("");
        this.cur = this.chars[this.index]; this.col = 1; this.line = 1;
    }
    addToken(type: string, value: string, col: number, len: number) {
        this.tokens.push({
            type: type, value: value, line: this.line, col: col, len: len
        });
    }
    next(steps=1) { this.index += steps; this.col += steps; this.cur = this.chars[this.index]; }
    tokenize() {
        while (this.index < this.chars.length) {
            let buffer: string = "";
            if (this.cur == '\"') {
                let col = this.col;
                this.next(); while (this.cur != '\"') {
                    if (this.cur == '\\') { buffer += '\\'; this.next(); }
                    buffer += this.cur; this.next();
                } this.addToken("string", buffer, col, buffer.length + 2); this.next();
            } else if (this.cur.match(/[a-zA-Z_]/)) {
                let col = this.col;
                while (this.cur.match(/[a-zA-Z_0-9]/)) { buffer += this.cur; this.next(); }
                switch (buffer) {
                    case "set": case "var": case "fun": case "if": case "else":
                        this.addToken("keyword", buffer, col, buffer.length); break;
                    case "string": case "number": case "array":
                        this.addToken("data type", buffer, col, buffer.length); break;
                    default: this.addToken("identifier", buffer, col, buffer.length); break;
                }
            } else if (this.cur.match(/[0-9]/)) {
                let col = this.col;
                while (this.cur.match(/[0-9]/) || this.cur == '.') { buffer += this.cur; this.next(); }
                this.addToken("number", buffer, col, this.col - col)
            } else {
                switch (this.cur) {
                    case '[': this.addToken("left brace",  "[", this.col, 1); this.next(); break;
                    case ']': this.addToken("right brace", "]", this.col, 1); this.next(); break;
                    case '(': this.addToken("left paren",  "(", this.col, 1); this.next(); break;
                    case ')': this.addToken("right paren", ")", this.col, 1); this.next(); break;
                    case ':': this.addToken("colon",       ":", this.col, 1); this.next(); break;
                    case ';': this.addToken("semi colon",  ";", this.col, 1); this.next(); break;
                    case ' ': this.next(); break;
                    case '\r': break; case '\n': this.next(); this.col = 1; this.line += 1; break;
                    case '=': {
                        if (this.chars[this.index + 1] == ">") {
                            this.addToken("arrow", "=>",   this.col, 2); this.next();
                        } else if (this.chars[this.index + 1] == "=") {
                            this.addToken("equal to", "==", this.col, 2); this.next();
                        } else { this.addToken("assign", "=", this.col, 1); 
                        } this.next(); break;
                    }
                    default: console.log(`Unknown: ${JSON.stringify(this.cur)}`); this.next(); break;
                }
            }
        }
        return this.tokens;
    }
} 