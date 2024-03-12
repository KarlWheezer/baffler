use lexer::Lexer;
use parser::Parser;

mod lexer;
mod token;
mod util;
mod tree;
mod parser;

#[allow(unused_variables, unused_mut)]
fn main() {
	let lexer = Lexer::new()
		.init(std::env::args().nth(1).unwrap());
	let parser = Parser::new().init(lexer);
}