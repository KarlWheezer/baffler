import { Generate } from "./generate";
import { Lexer } from "./lexer";
import { Parser } from "./parser";

const lexer = new Lexer("test/main.baf");
const parser = new Parser(lexer);
const generate = new Generate(parser);

generate.generateFile();