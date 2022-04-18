import fs from 'fs';

export enum t {
    identifier, string,
    keyword, number,
    operator, compare,

    l_paren,
    r_paren,
    l_brace,
    r_brace,
    
    equals, arrow,
    semi_colon,
    comma, EOF,
    not_important
}

export class token {
    type: t; value: string; line: number; col: number; len: number;
    constructor(type: t, value: string, line: number, col: number) {
        this.type = type; this.value = value; this.line = line; this.col = col; this.len = value.length;
    }
    toString(): string {
        switch (this.type) {
            case t.identifier:  return "identifier";
            case t.string:      return "string";
            case t.keyword:     return "keyword";
            case t.number:      return "number";
            case t.operator:    return "operator";
            case t.compare:     return "compare";
        
            case t.l_paren:     return "left paren";
            case t.r_paren:     return "right paren";
            case t.l_brace:     return "left brace";
            case t.r_brace:     return "right brace";
            
            case t.equals:      return "equals";
            case t.arrow:       return "arrow";
            case t.semi_colon:  return "semi colon";
            case t.comma:       return "comma";
            case t.EOF:         return "End of file";
            case t.not_important:return "not important"
        }
    }
}

const isalnum = (char: string) => { return char.match(/[a-zA-Z_0-9]/) != null && char.match(/[a-zA-Z_0-9]/) != undefined; }

export class Lexer {
    content: string; index: number; cur: string; line: number; col: number; filename: string; tokens: token[];
    keywords: string[] = ["set", "var", "fun", "if", "else", "return", "import"];
    constructor(filename: string) {
        this.filename = filename; this.index = 0; this.content = fs.readFileSync(filename).toString() + '\0';
        this.cur = this.content[this.index]; this.line = 1; this.col = 1; this.tokens = [];
    }
    add(type: t, value: string, col: number) { this.tokens.push(new token(type, value, this.line, col)); }
    next(steps: number = 1) { this.index += steps; this.col += steps;
        if (this.index >= this.content.length) { this.cur = '\0'; return; }
        this.cur = this.content[this.index]; return;
    }
    tokenize() { let col = this.col;
        if (this.cur.match(/[a-zA-Z_]/)) { let buffer: string = "";
            while (isalnum(this.cur)) { buffer += this.cur; this.next(); }
            if (this.keywords.includes(buffer)) { this.add(t.keyword, buffer, col);
            } else { this.add(t.identifier, buffer, col); };
        } else if (this.cur.match(/[0-9]/)) { let buffer: string = "";
            while (this.cur.match(/[0-9]|\./)) { buffer += this.cur; this.next(); }
            this.add(t.number, buffer, col);
        } else if (this.cur == '"') { this.next(); let buffer: string = "";
            while (this.cur != '"') {
                if (this.cur == '\\') { buffer += this.cur; this.next(); }
                if (this.index >= this.content.length) { console.log(`Unexpected end of file without string terminating characture '\"' ---> ${this.filename}[${this.line}:${col}]`); }
                buffer += this.cur; this.next();
            } this.next(); this.add(t.string, buffer, col);
        } else {
            switch (this.cur) {
                case '[': this.add(t.l_brace, this.cur, col); this.next();      break;
                case ']': this.add(t.r_brace, this.cur, col); this.next();      break;
                case '(': this.add(t.l_paren, this.cur, col); this.next();      break;
                case ')': this.add(t.r_paren, this.cur, col); this.next();      break;
                case ';': this.add(t.semi_colon, this.cur, col); this.next();   break;
                case ',': this.add(t.comma, this.cur, col);   this.next();      break;
                case '-': case '+': case '/': case '*': 
                          this.add(t.operator, this.cur, col);   this.next();   break;
                case ' ': this.next();                                          break;
                case '\n': this.next(); this.col = 1; this.line += 1;           break;
                case '\r': this.next(); this.col -= 1;                          break;
                case '=':
                    if (this.content[this.index + 1] == '>') { this.next(2);
                        this.add(t.arrow, "=>", col); break;
                    } else if (this.content[this.index + 1] == '=') { this.next(2);
                        this.add(t.compare, "==", col); break;
                    } else { this.next(); this.add(t.equals, "=", col); break; }
                case '\0': this.add(t.EOF, '\0', col); return t.EOF;
                default:   console.log(`Unknown characture ${JSON.stringify(this.cur)} ---> ${this.filename}[${this.line}:${col}]`); this.next(); break;
            }
        }
    }
    lex() {
        while (true) {
            let token = this.tokenize(); if (token == t.EOF) break;
        } return this.tokens;
    }
}