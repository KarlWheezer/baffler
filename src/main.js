"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generate_1 = require("./generate");
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
const lexer = new lexer_1.Lexer("test/main.baf");
const parser = new parser_1.Parser(lexer);
const generate = new generate_1.Generate(parser);
generate.generateFile();
