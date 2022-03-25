import { Lexer } from "./lexer";
import { Parser } from "./parser";

const lexer = new Lexer("tests/main.baf");
const parser = new Parser(lexer);
parser.parse();