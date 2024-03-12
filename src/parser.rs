use std::fmt::Display;

use crate::{lexer::Lexer, token::{Class, Token, Tokens}, tree::{Expression, Statement}, util::{Colorize, Split}};

pub struct Parser {
   tokens: Tokens,
   index: usize,
   errors: Vec<String>,

   code: Vec<String>,
   path: String,
}


impl Parser {
   pub fn new() -> Self {
      Self { 
         tokens: vec![], index: 0, 
         errors: vec![], code: vec![], 
         path: "".into() 
      }
   }
   pub fn init(mut self, mut lexer: Lexer) -> Self {
      let tokens = lexer.tokenize();

      if !tokens.is_ok() {
         println!("{}", tokens.unwrap_err());
         std::process::exit(-1);
      } 

      self.tokens = tokens.unwrap();
      self.path = lexer.filename;
      self.code = lexer.source.split('\n');

      return self;
   }

   fn next(&mut self) {
      self.index += 1;
   }
   fn fetch(&mut self, offset: isize) -> Token {
      let index = (self.index as isize) + offset;

      let token = if index >= self.tokens.len() as isize {
         self.tokens.last().unwrap()
      } else if index < 0 {
         self.tokens.first().unwrap()
      } else {
         &self.tokens[index as usize]
      }.clone();

      return token;
   }
   fn check<S:Display>(&mut self, class: Class, problem: S) -> Token {
      let token = self.fetch(0);
      if token.class != class {
         self.error(&token, class, problem);
      }

      self.next(); return token;
   }
   fn error<S:Display>(&mut self, token: &Token, class: Class, problem: S) {
      let mut message = "".to_string();
      let mut line = "".to_string();

      for _ in 0..token.index[0].to_string().len()
         { line += " "; }
      
      for _ in 1..token.index[1] 
         { message += " "; } message += "^";
      for _ in 1..token.value.len()
         { message += "~"; } 
      message += &format!("expected {}, not {}", class, token.class);

      self.errors.push(format!("{}", vec![
         format!("{}{:?}:{} --> {}", self.path, token.index, "error".colorize(31), problem),
         format!("{} | {}", line, self.code[token.index[0] - 1]),
         format!("{} | {}", line, message),
         format!("{} | {}", line, problem)
      ].join("\n")));
   }

   pub fn collect_expression(&mut self) -> Expression { todo!() }
   fn collect_literal(&mut self) -> Expression { todo!() }
   fn collect_array(&mut self) -> Expression { todo!() }
   fn collect_index(&mut self) -> Expression { todo!() }
   fn collect_compound(&mut self) -> Expression { todo!() }
   fn collect_boolean(&mut self) -> Expression { todo!() }
   fn collect_function(&mut self) -> Expression { todo!() }
   fn collect_arg_definition(&mut self) -> Expression { todo!() }
   fn collect_sub_expression(&mut self) -> Expression { todo!() }

   pub fn resolve_fun_define(&mut self) -> Statement { todo!() }
   fn resolve_set_assign(&mut self) -> Statement { todo!() }
   fn resolve_var_assign(&mut self) -> Statement { todo!() }
   fn resolve_reassignment(&mut self) -> Statement { todo!() }
   fn resolve_import(&mut self) -> Statement { todo!() }
   fn resolve_expression(&mut self) -> Statement { todo!() }
}