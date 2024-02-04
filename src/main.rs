use lexer::Lexer;
use parser::Parser;
use token::Class;
use tree::Syntax;
use util::WithError;

mod lexer;
mod token;
mod util;
mod tree;
mod parser;

fn main() {
	let lexer = Lexer::init();
	let mut parser = Parser::init(lexer);
	println!("{}", parser.collect_expression([0, 0]));
}