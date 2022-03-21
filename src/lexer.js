"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const fs = __importStar(require("fs"));
class Lexer {
    constructor(file_name) {
        this.file_name = file_name;
        this.index = 0;
        this.tokens = [];
        let code = fs.readFileSync(this.file_name).toString().replace("\r", "");
        this.lines = code.split("\n");
        this.chars = code.split("");
        this.cur = this.chars[this.index];
        this.col = 1;
        this.line = 1;
    }
    addToken(type, value, col) {
        this.tokens.push({
            type: type, value: value, line: this.line, col: col, len: this.col - col
        });
    }
    next(steps = 1) { this.index += steps; this.col += steps; this.cur = this.chars[this.index]; }
    tokenize() {
        while (this.index < this.chars.length) {
            let buffer = "";
            if (this.cur == '\"') {
                let col = this.col;
                this.next();
                while (this.cur != '\"') {
                    if (this.cur == '\\') {
                        buffer += '\\';
                        this.next();
                    }
                    buffer += this.cur;
                    this.next();
                }
                this.addToken("imbeded string", buffer, col);
                this.next();
            }
            else if (this.cur.match(/[a-zA-Z_]/)) {
                let col = this.col;
                while (this.cur.match(/[a-zA-Z_0-9]/)) {
                    buffer += this.cur;
                    this.next();
                }
                switch (buffer) {
                    case "set":
                    case "var":
                    case "fun":
                    case "if":
                    case "else":
                        this.addToken("keyword", buffer, col);
                        break;
                    case "string":
                    case "number":
                    case "array":
                        this.addToken("data type", buffer, col);
                        break;
                    default:
                        this.addToken("identifier", buffer, col);
                        break;
                }
            }
            else if (this.cur.match(/[0-9]/)) {
                let col = this.col;
                while (this.cur.match(/[0-9]/) || this.cur == '.') {
                    buffer += this.cur;
                    this.next();
                }
                this.addToken("number", buffer, col);
            }
            else {
                switch (this.cur) {
                    case '[':
                        this.addToken("left brace", "[", this.col);
                        this.next();
                        break;
                    case ']':
                        this.addToken("right brace", "]", this.col);
                        this.next();
                        break;
                    case '(':
                        this.addToken("left paren", "(", this.col);
                        this.next();
                        break;
                    case ')':
                        this.addToken("right paren", ")", this.col);
                        this.next();
                        break;
                    case ':':
                        this.addToken("colon", ":", this.col);
                        this.next();
                        break;
                    case ';':
                        this.addToken("semi colon", ";", this.col);
                        this.next();
                        break;
                    case ' ':
                        this.next();
                        break;
                    case '\r': break;
                    case '\n':
                        this.next();
                        this.col = 1;
                        this.line += 1;
                        break;
                    case '=': {
                        if (this.chars[this.index + 1] == ">") {
                            this.addToken("arrow", "=>", this.col);
                            this.next();
                        }
                        else if (this.chars[this.index + 1] == "=") {
                            this.addToken("equal to", "==", this.col);
                            this.next();
                        }
                        else {
                            this.addToken("assign", "=", this.col);
                        }
                        this.next();
                        break;
                    }
                    default:
                        console.log(`Unknown: ${JSON.stringify(this.cur)}`);
                        this.next();
                        break;
                }
            }
        }
        return this.tokens;
    }
}
exports.Lexer = Lexer;
