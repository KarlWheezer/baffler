import { t } from './lexer'
import fs from 'fs';
import { Parser } from './parser';

export class Generate {
    parser: Parser; statements: any[]; filename: string;
    constructor(parser: Parser) {
        this.parser = parser; this.filename = this.parser.lexer.filename;
        this.statements = this.parser.parse();
    }
    generateFile() {
        fs.writeFileSync(this.parser.lexer.filename.replace(".baf", ".js"), this.generate(this.statements));
    }
    generate(statements: any[]) { const lines: string[] = [];
        for (let statement of statements) {
            let line = this.generateStatement(statement);
            lines.push(line);
        } return lines.join("\n");
    }
    generateStatement(node: any): any {
        switch(node.type) {
            case t.string: return `"${node.value}"`;
            case "array": let array: any[] = [];
                for (let i=0; i < node.value.length; i ++) { array.push(this.generateStatement(node.value[i])); }
                return `[${array.join(", ")}]`;
            case t.identifier: case t.number: 
                return `${node.value}`;
            case 'set-assign': return `const ${node.name.value} = ${this.generateStatement(node.value)};`
            case 'var-assign': return `let ${node.name.value} = ${this.generateStatement(node.value)};`
            case 're-assignment': return `${node.name.value} = ${this.generateStatement(node.value)};`
            case 'import': return `//import "${node.path.value}";`;
            case "expression": return `${this.generateStatement(node.left)} ${node.operator.value} ${this.generateStatement(node.right)}`
            case 'fun-call': let args = [];
                for (let i=0; i < node.args.length; i ++) { args.push(this.generateStatement(node.args[i])); }
                return `${node.name.value}(${args.join(", ")});`;
            case "fun-def": let args_ = []; let statements = [];
                for (let i=0; i < node.args.length; i ++) { args_.push(this.generateStatement(node.args[i])); }
                for (let i=0; i < node.statements.length; i ++) { statements.push(this.generateStatement(node.statements[i])); }
                return `function ${node.name.value}(${args_}) {\n    ${statements.join("\n    ")}\n}`;
        }
    }
}