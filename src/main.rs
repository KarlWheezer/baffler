use lexer::Lexer;

mod lexer;
mod token;
mod util;

fn main() {
	let lexer = Lexer::init();
	for t in lexer.tokenize() {
		println!("{t}")
	}
}