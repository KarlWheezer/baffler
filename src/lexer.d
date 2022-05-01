module lexer;

import baffler;
import std.stdio;
import std.conv;
import std.ascii;
import core.stdc.stdlib;


enum Type {    
    ident="identifier", key="keyword", 
    str="string", num="number",
    oper="operator", comp="compare",

    lpr="left paren", lbk="left bracket", lbc="left brace",
    rpr="right paren", rbk="right bracket", rbc="right brace",
    
    eq="equal", arr="arrow", semi="semi colon",
    com="comma", EOF="End of file", dot="dot",
}

class Token {
    Type type; string value;
    int line; int col;

    this(Type type, string value, int line, int col) {
        this.type = type; this.value = value;
        this.line = line; this.col = col;
    }

    override string toString() const {
        return "Token [ type = "~this.type~", value = \""~this.value~"\", line = "~to!string(this.line)~", col = "~to!string(this.col)~" ];";
    }
}

class Lexer {
    string filename; string code;
    int index=0; int column=1; int line=1;
    char cur; Token[] tokens;

    this(string[] args) {
        this.code = read(args)~"\0"; this.tokens = [];
        this.filename = args[1]; this.cur = this.code[0];
    }

    override string toString() const {
        return "Lexer [ filename = \""~filename~"\", cur = '"~to!string(cur)~"', position = [ index = "~to!string(index)~", col = "~to!string(column)~", line = "~to!string(line)~" ] ]";
    }

    void push(Type type, string value, int col) {
        tokens.length += 1; tokens[tokens.length - 1] = new Token(type, value, line, col);
    }

    void advance(int steps = 1) {
        this.index += steps; this.column += steps;
        this.cur = this.code[this.index];
    }

    void tokenize() { int col = this.column;
        if (isAlpha(this.cur)) { string buffer = "";
            while (isAlphaNum(this.cur) || this.cur == '_') { buffer ~= cur; advance(); }
            push(Type.ident, buffer.dup, col);
        } else if (isDigit(cur)) { string buffer = "";
            while (isDigit(cur) || this.cur == '.') { buffer ~= cur; advance(); }
            push(Type.num, buffer.dup, col);
        } else if (this.cur == '"') { advance(); string buffer = "";
            while (this.cur != '"') { 
                if (this.cur == '\\') { buffer ~= this.cur; advance(); }
                if (this.index >= this.code.length - 1) 
                    err("end of file reached without string closing characture '\"'");
                buffer ~= this.cur; advance(); 
            } advance(); push(Type.str, buffer, col);
        } else switch(cur) {
            case '[': push(Type.lbc, to!string(cur), col); advance(); break;
            case '{': push(Type.lbk, to!string(cur), col); advance(); break;
            case '(': push(Type.lpr, to!string(cur), col); advance(); break;

            case ']': push(Type.rbc, to!string(cur), col); advance(); break;
            case '}': push(Type.rbk, to!string(cur), col); advance(); break;
            case ')': push(Type.rpr, to!string(cur), col); advance(); break;

            case '.': push(Type.dot, to!string(cur), col); advance();  break;
            case ',': push(Type.com, to!string(cur), col); advance();  break;
            case ';': push(Type.semi,to!string(cur), col); advance();  break;

            case ' ':  advance();  break;
            case '\r': advance();  break;
            case '\n': advance(); this.column = 1; this.line += 1; break;

            case '=':
                if (code[index + 1] == '>'){ push(Type.arr, "=>", col); advance(2); break; }
                else if (code[index + 1] == '='){ push(Type.comp, "==", col); advance(2); break; }
                else { push(Type.eq, "=", col); advance(); break; }
            
            case '>': case '<':
                if (code[index + 1] == '='){ push(Type.comp, cur~"=", col); advance(2); break; 
                } else { push(Type.comp, to!string(cur), col); advance(); break;  }
            
            default: writeln("\""~cur~"\""); advance();
    }   }

    void lex() { while (this.index < this.code.length-1) { tokenize(); } push(Type.EOF, "\0", column); }

    void err(string msg) {
        writeln("\x1b[31mError\x1b[0m"~msg~" "~filename~"["~to!string(line)~":"~to!string(column)~"]"); 
        exit(1); 
    }
}