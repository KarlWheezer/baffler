import fs from 'fs';

export enum token_type {
    start,
    identifier, keyword,
    string, number,

    left_brace,
    right_brace,
    left_paren,
    right_paren,

    assign,
    arrow,
    dot,
    semi_colon,
    comma,
    undefined, EOF,
    compare
}

export class token {
    type: token_type; value: string; line: number; col: number; len: number;
    constructor(type: token_type, value: string, line: number, col: number) {
        this.type = type; this.value = value; this.line = line; this.col = col; this.len = this.value.length;
    }
    new() { return {type: this.type, value: this.value, pos: {line: this.line, col: this.col}, len: this.len}; }
    toString() { return `${token_type[this.type].replace("_", " ")}` }
}

export class Lexer {
    filename: string; index: number = 0; line: number = 1; col: number = 1;
    lines: string[]; cur: string; chars: string[]; tokens: token[];
    constructor(filename: string) {
        this.filename = filename; let content = fs.readFileSync(this.filename).toString(); this.tokens = [];
        this.lines = content.split("\n"); this.chars = content.split(""); this.cur = this.chars[this.index];
    }
    add(type: token_type, value: string, col: number) {
        const tok = new token(type, value, this.line, col);
        this.tokens.push(tok);
    }
    next(steps: number = 1): undefined { 
        this.index += steps; this.col += steps; this.cur = this.chars[this.index];
        if (this.index >= this.chars.length) this.cur = '\0'; return;
    }
    tokenize() { let col = this.col;
        if(this.cur.match(/[a-zA-Z_]/)) { let buffer: string = "";
            while (this.cur.match(/[a-zA-Z_0-9]/)) { buffer += this.cur; this.next(); }
            switch (buffer) { 
                case "set": case "var": case "if": case "else": case "fun": this.add(token_type.keyword, buffer, col); break;
                default: this.add(token_type.identifier, buffer, col); break;
            }
        } else if (this.cur.match(/[0-9]/)) { let buffer: string = "";
            while (this.cur.match(/[0-9]|\./)) { buffer += this.cur; this.next(); }
            this.add(token_type.number, buffer, col);
        } else if (this.cur === '"') { this.next(); let buffer: string = "";
            while (this.cur !== '"') {
                if (this.cur === '\\') { this.next(); buffer += this.cur; }
                buffer += this.cur; this.next(); 
            } this.next(); this.add(token_type.string, buffer, col+1);
        } else if (this.cur === '\0') { return "EOF";
        } else switch (this.cur) {
            case "[": this.add(token_type.left_brace,  this.cur, col); this.next(); break;
            case "]": this.add(token_type.right_brace, this.cur, col); this.next(); break;
            case "(": this.add(token_type.left_paren,  this.cur, col); this.next(); break;
            case ")": this.add(token_type.right_paren, this.cur, col); this.next(); break;
            case ";": this.add(token_type.semi_colon,  this.cur, col); this.next(); break;
            case ",": this.add(token_type.comma,       this.cur, col); this.next(); break;
            case ">": case "<": { let bufr = this.cur;
                if (this.chars[this.index + 1] === '=') bufr += this.cur; this.next();
                this.add(token_type.compare, bufr, col); break;
            }
            case '=': {
                if (this.chars[this.index + 1] === '>') { this.add(token_type.arrow,     "=>", col); this.next(2); break; }
                if (this.chars[this.index + 1] === '=') { this.add(token_type.compare,   "==", col); this.next(2); break; }
                this.add(token_type.assign, "=", col);
            }
            case ' ':  this.next();                                                 break; 
            case '\n': this.next(); this.col = 1; this.line += 1;                   break;
            default: console.log(JSON.stringify(this.cur)); this.next();            break;
        }
    }
    lex() { 
        let chars = [];
        for (let i of this.chars) { if (i !== '\r') chars.push(i); }
        
        this.chars = chars;let col = 0;
        while (true) {
            let addedToken = this.tokenize();
            if (addedToken === "EOF") break;
            col = this.tokens[this.tokens.length - 1].col;
        }
        this.add(token_type.EOF, '\0', this.lines[this.lines.length -1].length + 1);
        return this.tokens;
    }
}