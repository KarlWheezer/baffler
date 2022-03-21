import { Lexer } from "./lexer";
import { Parser } from "./parser";

let lexer = new Lexer("tests/main.baf");
let parser = new Parser(lexer);
parser.parse();