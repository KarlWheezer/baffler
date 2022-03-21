"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
let lexer = new lexer_1.Lexer("tests/main.baf");
let parser = new parser_1.Parser(lexer);
parser.parse();
