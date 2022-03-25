import * as fs from 'fs';

export type token = {
    type:  string,
    value: string,
    line:  number,
    col:   number,
    len:   number
}
export class Lexer {
    file_name: string; chars: string[]; 
    tokens: token[]; index: number; cur: string;
    line: number; col: number; lines: string[];
    constructor(file_name: string) {
        this.file_name = file_name; this.index = 0; this.tokens = [];
        let code = fs.readFileSync(this.file_name).toString().replace("\r", "");
        this.chars = code.split(""); this.chars = this.fixit();
        this.lines = code.split("\n");
        this.cur = this.chars[this.index]; this.col = 1; this.line = 1;
    }
    addToken(type: string, value: any, col: number, len: number) {
        this.tokens.push({
            type: type, value: value, line: this.line, col: col, len: len
        });
    }
    fixit() {
        let array = [];
        for (var i=0; i < this.chars.length; i ++) {
            if (this.chars[i] !== "\r") array.push(this.chars[i]);
        } return array;
    }
    next(steps=1) { this.index += steps; this.col += steps; this.cur = this.chars[this.index]; }
    match() {
        let col = this.col;
        if (this.cur.match(/[a-zA-Z_]/)) {
            let buffer = ""; while (this.cur.match(/[a-zA-Z_0-9]/)) {
                buffer += this.cur; this.next(); if (this.check()) break;
            }
            switch (buffer) {
                case "set": case "var": case "if": case "else": case "fun":
                    this.addToken("keyword", buffer, col, buffer.length); break;
                default: this.addToken("identifier", buffer, col, buffer.length); break;
            }
        } else if (this.cur.match(/[0-9]/)) {
            let buffer = ""; while (this.cur.match(/[0-9]/)) {
                buffer += this.cur; this.next(); if (this.check()) break;
            }; this.addToken("number", buffer, col, buffer.length);
        } else if (this.cur == '\"') {
            let buffer = ""; this.next(); while (this.cur != '\"') {
                buffer += this.cur; this.next(); if (this.check()) {
                    let msg = [
                        `\x1b[31mError\x1b[0m: End of file found without expected terminating characture '"' ---> ${this.file_name}[${this.line}:${this.col}]`
                    ].join("\n"); console.log(msg); process.exit(1);
                }
            } this.next(); this.addToken("string", buffer, col, buffer.length);
        } else {
            switch (this.cur) {
                case "(": this.addToken("left paren",  this.cur, col, 1); this.next(); break;
                case ")": this.addToken("right paren", this.cur, col, 1); this.next(); break;
                case "[": this.addToken("left brace",  this.cur, col, 1); this.next(); break;
                case "]": this.addToken("right brace", this.cur, col, 1); this.next(); break;
                case ";": this.addToken("semi", this.cur, col, 1);        this.next(); break;
                case ",": this.addToken("comma", this.cur, col, 1);       this.next(); break;
                case " ": this.next(); break; case "\n": this.next(); this.col = 1; this.line += 1; break; 
                case "=": {
                    if (this.chars[this.index + 1] == ">") {
                        this.addToken("arrow", "=>", col, 2); this.next();
                    } else if (this.chars[this.index + 1] == "=") {
                        this.addToken("equal to", "==", col, 2); this.next();
                    } else { this.addToken("assign", "=", col, 1) }
                    this.next(); break;
                }
                default: console.log(JSON.stringify(this.cur));           this.next(); break;
            }
        }
    }
    check() {
        if (this.index >= this.chars.length) return true;
    }
    lex() {
        while (this.index < this.chars.length) this.match();
        this.addToken("EOF", null, this.tokens[this.tokens.length - 1].col, 1);

        return this.tokens;
    }
}