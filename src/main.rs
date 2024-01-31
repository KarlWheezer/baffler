use lexer::Lexer;
use parser::Parser;

mod lexer;
mod token;
mod util;
mod tree;
mod parser;

fn main() {
	let lexer = Lexer::init();
	let mut parser = Parser::init(lexer);

	parser.tst();
}