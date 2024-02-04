use std::fmt::Display;

use serde::de::value;

use crate::token::{Class, Token};
use crate::lexer::Lexer;
use crate::tree::{Expression, Statement, Syntax};
use crate::util::{fmt, syntax, Colorize, Split, WithError};

pub struct Parser {
   pub tokens: Vec<Token>,

   pub filename: String,
   pub source: Vec<String>,
   index: usize
}

impl Parser {
   pub fn init(lexer: Lexer) -> Self {
      let filenm = lexer.filename.clone();
      let source = lexer.source.split('\n');

      Self { 
         tokens: lexer.tokenize(), 
         filename: filenm, source, index: 0 
      }
   }
   //: HELPER FUNCTIONS ://
   fn next(&mut self) {
      self.index += 1;
   }
   fn nth(&self, offset: usize) -> Token {
      let index = if self.index + offset <= self.tokens.len() 
         { self.index + offset } else { self.index };

      return self.tokens[index].clone();
   }
   fn cur(&self) -> Token {
      return self.nth(0);
   }
   pub fn info(&self) -> (&String, &String) {
      (&self.filename, &self.source[self.cur().index[0] - 1])
   }
   pub fn err<X>(token: &Token, info: X, information: String, area: (&String, &String)) where X:Display {
      let [mut buf, mut line] = [String::new(), String::new()];

      for _ in 0..token.index[0].to_string().len() 
         { line.push(' '); }
      for _ in 1..token.index[1]
         { buf.push(' '); } buf.push('^');
      for _ in 1..token.value.len()
         { buf.push('~'); }

      println!("{}", vec![
         format!("{}:{} --> {}{:?}: syntax error", "error".colorize(31), "parser".colorize(34), area.0, token.index),
         format!("{} | {}", token.index[0], area.1),
         format!("{} | {} {}", line, buf, info),
         format!("{} | info: {}", line, information)
      ].join("\n"));
   }
   pub fn eat(&mut self, class: Class) -> Result<Token, Token> {
      let token = self.cur(); self.next();
      if token.class != class {
         return Err(token)
      } return Ok(token);
   }
   //: expression parsing ://
   pub fn collect_expression(&mut self, parent: [usize; 2]) -> Expression {
      let token = self.cur();
      let value = match token.class {
         Class::Identifier => match self.nth(1).class {
            Class::LeftParen => self.collect_function(parent),
            _ => self.collect_literal(parent),
         },

         Class::LeftBrace => self.collect_array(parent),
         
         _ => self.collect_literal(parent),
      };

      match self.cur().class {
         Class::LeftBrace => self.collect_index(parent, value),
         Class::MathAgent => self.collect_compound(parent, value),
         Class::BoolAgent => self.collect_boolean(parent, value),

         _ => value
      }
   }
   fn collect_list(&mut self, parent: [usize; 2], brackets: [Class; 2], fun: fn(&mut Parser, [usize; 2]) -> Expression) -> Vec<Expression> {
      let mut array: Vec<Expression> = vec![]; 
      let mut collectable = true;
      
      self.eat(brackets[0])
         .with_error(&self, (Syntax::EXPR[parent[0]], parent[1]), "no open brackets for list parsing");

      loop {
         let token = self.cur();
         match token.class {
            Class::Comma => { collectable = true; self.next(); },
            _ if brackets[1] == token.class => { self.next(); break; },
            Class::Eof => {
               self.eat(brackets[1])
                  .with_error(&self, (Syntax::EXPR[parent[0]], parent[1]), "eof found before close bracket for list");
               break;
            },

            _ if collectable => {
               array.push(fun(self, [parent[0], parent[1] + 1]));
               collectable = false;
            },
            _ => {
               self.eat(Class::Comma)
                  .with_error(&self, (Syntax::EXPR[parent[0]], parent[1] + 1), "expression found before comma");
               break;
            }
         }
      }

      return array;
   }
   fn collect_literal(&mut self, parent: [usize; 2]) -> Expression {
      let value = self.cur(); self.next();
      Expression::Literal { value }
   }
   fn collect_array(&mut self, parent: [usize; 2]) -> Expression {
      let value = self.collect_list(
         [0, 0], [Class::LeftBrace, Class::RightBrace],
         Self::collect_expression
      );

      Expression::Array { value }
   }
   fn collect_index(&mut self, parent: [usize; 2], lhs: Expression) -> Expression {
      self.eat(Class::LeftBrace)
         .with_error(self, (Syntax::EXPR, vec![[1, 2], parent]), "expected '[' for indexing");

      let index = self.collect_expression([2, 2]);

      self.eat(Class::RightBrace)
         .with_error(self, (Syntax::EXPR, vec![[1, 4], parent]), "expected ']' for indexing");

      Expression::Index { array: Box::new(lhs), index: Box::new(index) }
   }
   fn collect_boolean(&mut self, parent: [usize; 2], lhs: Expression) -> Expression {
      let agent = self.cur(); self.next();
      let rhs = self.collect_expression([4, 1]);

      Expression::Boolean { lhs: Box::new(lhs), rhs: Box::new(rhs), agent }
   }
   fn collect_compound(&mut self, parent: [usize; 2], lhs: Expression) -> Expression {
      let agent = self.cur(); self.next();
      let rhs = self.collect_expression([3, 1]);

      Expression::Compound { lhs: Box::new(lhs), rhs: Box::new(rhs), agent }
   }
   fn collect_function(&mut self, parent: [usize; 2]) -> Expression {
      let name = self.eat(Class::Identifier)
         .with_error(&self, (Syntax::EXPR, vec![[5, 0], parent]), "expected name for function call");

      let args = self.collect_list([5, 0], [Class::LeftParen, Class::RightParen], Self::collect_expression);

      Expression::Function { name, args }
   }
   //: statement parsing ://
   fn parse_fundef(&mut self) -> Statement { todo!(); }
   fn parse_set_assign(&mut self) -> Statement { todo!(); }
   fn parse_var_assign(&mut self) -> Statement { todo!(); }
   fn parse_modify_var(&mut self) -> Statement { todo!(); }
   fn parse_use_package(&mut self) -> Statement { todo!(); }
   fn parse_expression(&mut self) -> Statement { todo!(); }
   fn parse_block(&self) -> Vec<Statement> { todo!(); }
}