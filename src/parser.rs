use crate::token::{Class, Token};
use crate::lexer::Lexer;
use crate::tree::{Expression, Statement, Syntax};
use crate::util::{Colorize, Fmt, Split, Then, ToVec};

pub struct Parser {
   tokens: Vec<Token>,

   filenm: String,
   source: Vec<String>,
   index: usize
}

impl Parser {
   pub fn init(lexer: Lexer) -> Self {
      let filenm = lexer.filename.clone();
      let source = lexer.source.split('\n');

      Self { 
         tokens: lexer.tokenize(), 
         filenm, source, index: 0 
      }
   }
   
   fn next(&mut self) {
      self.index += 1;
   }
   fn nth(&self, offset: usize) -> Token {
      let index = if self.index + offset >= self.tokens.len() 
         { self.index + offset } else { self.index };

      return self.tokens[index].clone();
   }
   fn cur(&self) -> Token {
      return self.nth(0);
   }
   fn info(&self, token: &Token) -> String {
      format!("{}{:?}", self.filenm, token.index)
   }
   fn eat(&mut self, value: (Class, &str)) -> Result<Token, Token> {
      let cur = self.cur(); self.next();
      
      match value.1.is_empty() {
         true => if cur.class == value.0 { return Ok(cur); }
         false => if cur.class == value.0 && &cur.value == value.1 { return Ok(cur); }
      }

      return Err(cur);
   }
   pub fn err<X, Y>(&self, token: Token, info: X, indecies: Y, syntax: &[&[&str]]) where X:ToString, Y:ToVec<[usize; 2]> {
      let mut bufr = "".to_string();
      let mut line = "".to_string();

      for _ in 0..token.index[0].to_string().len() 
         { line.push(' '); }

      let joiner = &format!("\n{} |     {} ", line, "|".colorize(36));

      for _ in 1..token.index[1]
         { bufr.push(' '); } bufr.push('^');
      for _ in 1..token.value.len() 
         { bufr.push('~'); }


      println!("{}", vec![
         format!("{}:{} --> {}", "error".colorize(31), "parser".colorize(36), self.info(&token)),
         format!("{} | {}", token.index[0], self.source[token.index[0] - 1]),
         format!("{} | {} {}", line, bufr, info.to_string()),
         format!("{} | {} {}", line, "info:".colorize(36), indecies.fmt(syntax).join(joiner))
      ].join("\n"));
   }

   pub fn tst(&mut self) {
      let _ = self.eat((Class::Arrow, "->")).then(&self, "idk", vec![[1, 1], [2, 2]], &Syntax::EXPR);
   }
}