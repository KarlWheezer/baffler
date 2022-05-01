import lexer;

import std.stdio;
import baffler;

void main(string[] args) {
    Lexer lexer = new Lexer(args);
    lexer.lex();
}