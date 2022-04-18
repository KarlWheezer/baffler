"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generate = void 0;
const lexer_1 = require("./lexer");
const fs_1 = __importDefault(require("fs"));
class Generate {
    constructor(parser) {
        this.parser = parser;
        this.filename = this.parser.lexer.filename;
        this.statements = this.parser.parse();
    }
    generateFile() {
        fs_1.default.writeFileSync(this.parser.lexer.filename.replace(".baf", ".js"), this.generate(this.statements));
    }
    generate(statements) {
        const lines = [];
        for (let statement of statements) {
            let line = this.generateStatement(statement);
            lines.push(line);
        }
        return lines.join("\n");
    }
    generateStatement(node) {
        switch (node.type) {
            case lexer_1.t.string: return `"${node.value}"`;
            case "array":
                let array = [];
                for (let i = 0; i < node.value.length; i++) {
                    array.push(this.generateStatement(node.value[i]));
                }
                return `[${array.join(", ")}]`;
            case lexer_1.t.identifier:
            case lexer_1.t.number:
                return `${node.value}`;
            case 'set-assign': return `const ${node.name.value} = ${this.generateStatement(node.value)};`;
            case 'var-assign': return `let ${node.name.value} = ${this.generateStatement(node.value)};`;
            case 're-assignment': return `${node.name.value} = ${this.generateStatement(node.value)};`;
            case 'import': return `//import "${node.path.value}";`;
            case "expression": return `${this.generateStatement(node.left)} ${node.operator.value} ${this.generateStatement(node.right)}`;
            case 'fun-call':
                let args = [];
                for (let i = 0; i < node.args.length; i++) {
                    args.push(this.generateStatement(node.args[i]));
                }
                return `${node.name.value}(${args.join(", ")});`;
            case "fun-def":
                let args_ = [];
                let statements = [];
                for (let i = 0; i < node.args.length; i++) {
                    args_.push(this.generateStatement(node.args[i]));
                }
                for (let i = 0; i < node.statements.length; i++) {
                    statements.push(this.generateStatement(node.statements[i]));
                }
                return `function ${node.name.value}(${args_}) {\n    ${statements.join("\n    ")}\n}`;
        }
    }
}
exports.Generate = Generate;
