import { Lexer } from "./lexer";

let lexer = new Lexer("tests/main.baf");
console.log(lexer.tokenize());