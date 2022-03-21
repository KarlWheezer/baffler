"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = require("./lexer");
let lexer = new lexer_1.Lexer("tests/main.baf");
console.log(lexer.tokenize());
