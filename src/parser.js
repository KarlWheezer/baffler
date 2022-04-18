"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const lexer_1 = require("./lexer");
class Parser {
    constructor(lexer) {
        this.lexer = lexer;
        this.statements = [];
        this.tokens = lexer.lex();
        this.index = 0;
        this.prev = this.tokens[this.index];
        this.errors = 1;
        this.cur = this.tokens[this.index];
        this.next = this.tokens[this.index + 1];
    }
    advance(steps = 1) {
        this.index += steps;
        this.prev = this.tokens[this.index - 1];
        this.cur = this.tokens[this.index];
        this.next = this.tokens[this.index + 1];
    }
    error(top, value, current, ...types) {
        let i = 0;
        let buffer = "";
        while (i < current.col - 1) {
            buffer += " ";
            i++;
        }
        buffer += "^";
        i = 0;
        while (i < current.len - 1) {
            buffer += "~";
            i++;
        }
        let msg = [
            `\x1b[31mError\x1b[0m: ${top} -> ${this.lexer.filename}[${current.line}:${current.col}]`,
            `\x1b[36m${current.line} |\x1b[0m ${this.lexer.content.split("\n")[current.line - 1]}`,
            `${String(current.line).replace(/^[0-9]*/, " ")} \x1b[36m|\x1b[0m ${buffer} Unexpected ${lexer_1.t[current.type]}, wanted a token matching`
        ];
        let str = [];
        types.forEach(v => str.push(lexer_1.t[v]));
        msg[msg.length - 1] += ` [ ${str.join(", ")} ]`;
        if (value != null)
            msg[msg.length - 1] += ` with value '${value}'`;
        console.log(msg.join("\n"));
        this.errors += 1;
        this.advance();
    }
    eat(value, ...types) {
        if (this.index >= this.tokens.length || this.cur.type == lexer_1.t.EOF) {
            this.error(`Unexpected end of file`, value, this.cur, ...types);
            process.exit(1);
        }
        if (value != null) {
            for (let i = 0; i < types.length; i++)
                if (this.cur.value == value && this.cur.type == types[i]) {
                    this.advance();
                    return this.prev;
                }
        }
        if (value == null) {
            for (let i = 0; i < types.length; i++)
                if (this.cur.type == types[i]) {
                    this.advance();
                    return this.prev;
                }
        }
        this.error(`Unexpected ${this.cur.toString()} token`, value, this.cur, ...types);
        this.advance();
        return this.prev;
    }
    literal() {
        let literals = [lexer_1.t.identifier, lexer_1.t.string, lexer_1.t.number];
        if (this.cur.type == lexer_1.t.identifier && this.next.type == lexer_1.t.l_paren) {
            return this.parse_fun_call();
        }
        else if (this.cur.value == '[') {
            return { type: 'array', value: this.parse_list("]"), line: this.prev.line, col: this.prev.line };
        }
        else if (this.next.type == lexer_1.t.operator) {
            return this.parse_expr();
        }
        else if (literals.includes(this.cur.type)) {
            return this.eat(null, ...literals);
        }
        else if (this.cur.value == 'fun' && this.cur.type == lexer_1.t.keyword) {
            return this.parse_fun_call();
        }
        else {
            this.error(`${this.cur.type} is a non assignable value`, null, this.cur, lexer_1.t.not_important);
            process.exit(1);
        }
    }
    parse_fun_def() {
        this.eat("fun", lexer_1.t.keyword);
        let name = this.eat(null, lexer_1.t.identifier);
        let args = this.parse_list(")");
        let statements = this.parse_block();
        return { type: 'fun-def', name, args, statements, line: name.line, col: name.col - 4 };
    }
    parse_return() {
        let start = this.eat("return", lexer_1.t.keyword);
        let value = this.literal();
        return { type: 'return', value, line: start.line, col: start.col, len: value.col - start.col };
    }
    parse_block() {
        let statements = [];
        this.eat("[", lexer_1.t.l_brace);
        while (true) {
            if (this.cur.value == ']')
                break;
            if (this.index >= this.tokens.length || this.cur.type == lexer_1.t.EOF) {
                this.error(`End of file reached without block closing characture ']'`, null, this.cur, lexer_1.t.r_brace);
                process.exit(1);
            }
            statements.push(this.parse_statement());
        }
        this.eat("]", lexer_1.t.r_brace);
        return statements;
    }
    parse_import() {
        let start = this.eat("import", lexer_1.t.keyword);
        let path = this.eat(null, lexer_1.t.string);
        return { type: 'import', path, line: start.line, col: start.col, len: path.col - start.col };
    }
    parse_fun_call() {
        let name = this.eat(null, lexer_1.t.identifier);
        let args = this.parse_list(")");
        return { type: 'fun-call', name, args, line: name.line, col: name.col, len: this.prev.col - name.col };
    }
    parse_list(end) {
        let array = [];
        this.advance();
        while (true) {
            if (this.cur.value == end) {
                break;
            }
            else if (this.cur.value == ',') {
                this.advance();
                if (this.cur.type != lexer_1.t.r_paren)
                    array.push(this.literal());
            }
            else {
                array.push(this.literal());
            }
        }
        this.advance();
        return [...array];
    }
    parse_assign(type) {
        let start = this.eat(type, lexer_1.t.keyword).col;
        let name = this.eat(null, lexer_1.t.identifier);
        this.eat("=", lexer_1.t.equals);
        let value = this.literal();
        return { type: `${type}-assign`, name, value, line: name.line, col: name.col, len: this.prev.col - start };
    }
    parse_reassign() {
        let name = this.eat(null, lexer_1.t.identifier);
        this.eat("=", lexer_1.t.equals);
        let value = this.literal();
        return { type: 're-assignment', name, value, line: name.line, col: name.col, len: this.prev.col - name.col };
    }
    parse_expr() {
        let left = this.eat(null, lexer_1.t.number);
        let op = this.eat(null, lexer_1.t.operator);
        let right = this.eat(null, lexer_1.t.number);
        return { type: 'expression', left, operator: op, right, line: left.line, col: left.col };
    }
    parse_statement() {
        let statement;
        if (this.cur.value == 'set' || this.cur.value == 'var' && this.cur.type == lexer_1.t.keyword) {
            statement = this.parse_assign(this.cur.value);
            this.eat(";", lexer_1.t.semi_colon);
            return statement;
        }
        else if (this.cur.type == lexer_1.t.identifier && this.next.value == '(') {
            statement = this.parse_fun_call();
            this.eat(";", lexer_1.t.semi_colon);
            return statement;
        }
        else if (this.cur.type == lexer_1.t.keyword && this.cur.value == 'fun') {
            return this.parse_fun_def();
        }
        else if (this.cur.value == "return" && this.cur.type == lexer_1.t.keyword) {
            statement = this.parse_return();
            this.eat(";", lexer_1.t.semi_colon);
            return statement;
        }
        else if (this.cur.value == "import" && this.cur.type == lexer_1.t.keyword) {
            statement = this.parse_import();
            this.eat(";", lexer_1.t.semi_colon);
            return statement;
        }
        else if (this.cur.type == lexer_1.t.identifier && this.next.type == lexer_1.t.equals) {
            statement = this.parse_reassign();
            this.eat(";", lexer_1.t.semi_colon);
            return statement;
        }
        else {
            console.log(JSON.stringify(this.cur));
            this.advance();
        }
    }
    parse() {
        while (this.index <= this.tokens.length && this.cur.type != lexer_1.t.EOF) {
            this.statements.push(this.parse_statement());
        }
        return this.statements;
    }
}
exports.Parser = Parser;
