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
    addToken(type: string, value: string, col: number) {
        this.tokens.push({
            type: type, value: value, line: this.line, col: col, len: this.col - col
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
                } this.addToken("string", buffer, col); this.next();
            } else if (this.cur.match(/[a-zA-Z_]/)) {
                let col = this.col;
                while (this.cur.match(/[a-zA-Z_0-9]/)) { buffer += this.cur; this.next(); }
                switch (buffer) {
                    case "set": case "var": case "fun": case "if": case "else":
                        this.addToken("keyword", buffer, col); break;
                    case "string": case "number": case "array":
                        this.addToken("data type", buffer, col); break;
                    default: this.addToken("identifier", buffer, col); break;
                }
            } else if (this.cur.match(/[0-9]/)) {
                let col = this.col;
                while (this.cur.match(/[0-9]/) || this.cur == '.') { buffer += this.cur; this.next(); }
                this.addToken("number", buffer, col)
            } else {
                switch (this.cur) {
                    case '[': this.addToken("left brace",  "[", this.col); this.next(); break;
                    case ']': this.addToken("right brace", "]", this.col); this.next(); break;
                    case '(': this.addToken("left paren",  "(", this.col); this.next(); break;
                    case ')': this.addToken("right paren", ")", this.col); this.next(); break;
                    case ':': this.addToken("colon",       ":", this.col); this.next(); break;
                    case ';': this.addToken("semi colon",  ";", this.col); this.next(); break;
                    case ' ': this.next(); break;
                    case '\r': break; case '\n': this.next(); this.col = 1; this.line += 1; break;
                    case '=': {
                        if (this.chars[this.index + 1] == ">") {
                            this.addToken("arrow", "=>",   this.col); this.next();
                        } else if (this.chars[this.index + 1] == "=") {
                            this.addToken("equal to", "==", this.col); this.next();
                        } else { this.addToken("assign", "=", this.col); 
                        } this.next(); break;
                    }
                    default: console.log(`Unknown: ${JSON.stringify(this.cur)}`); this.next(); break;
                }
            }
        }
        return this.tokens;
    }
}