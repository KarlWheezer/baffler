use std::fmt::Display;

use crate::{token::{Class, Token, Tokens}, util::{Colorize, Split}};

pub struct Lexer {
   index: usize,
   coord: [usize; 2],

   pub filename: String,
   pub source: String,
   tokens: Tokens,
   errors: Vec<String>
}

impl Lexer {
   pub fn new() -> Self {
      Self { 
         index: 0, coord: [1, 1], 
         filename: String::new(), 
         source: String::new(), 
         tokens: vec![],
         errors: vec![],
      }
   }
   pub fn init(mut self, filename: String) -> Self {
      self.filename = filename.clone();
      self.source = if std::fs::read_to_string(&filename).is_ok() {
         std::fs::read_to_string(&filename).unwrap()
      } else {
         "\0".to_string()
      };

      return self;
   }

   fn char(&self) -> char {
      if self.index < self.source.len() 
         { self.source.as_bytes()[self.index] as char } else { '\0' }
   }
   fn next(&mut self) {
      if self.char() == '\n'
         { self.coord[0] += 1; self.coord[1] = 1; }
      self.coord[1] += 1;
      self.index += 1;
   }
   fn push(&mut self, class: Class, value: String, index: [usize; 2]) {
      self.tokens.push(Token::new(class, value, index));
   }
   fn stack(&mut self, class: Class) {
      self.push(class, self.char().to_string(), self.coord);
      self.next();
   }
   fn error<S:Display>(&mut self, description: S) {
      self.errors.push(format!("{}[{}:{}]:error - {}", self.filename, self.coord[0], self.coord[1], description));
   }

   fn scan(&mut self) {
      let cur = self.char();
      match cur {
         _ if cur.is_alphabetic() => {
            let mut value = String::new();
            let index = self.coord.clone();

            while self.char().is_alphanumeric() 
               { value.push(self.char()); self.next(); }
            
            let class = match value.as_str() {
               "fun" | "set" | "var" | "if" |
               "use" | "pass" => Class::Keyword,
               "true" | "false" => Class::Boolean,
               _ => Class::Identifier
            };

            self.push(class, value, index);
         },
         _ if cur.is_numeric() => {
            let mut value = String::new();
            let index = self.coord.clone();
            let mut dots: u8 = 0;

            while self.char().is_numeric() || self.char() == '.' {
               if self.char() == '.' {
                  dots += 1;
                  if dots < 1 { value.push('.'); self.next(); }
                  else {
                     self.error("too many '.' found while looking for number");
                  }
               }
               value.push(self.char());
               self.next();
            }

            self.push(Class::Number, value, index);
         },
         
         '"' => {
            let mut value = String::new();
            let index = self.coord.clone();
        
            self.next(); // Skip initial '"'
            while self.char() != '"' {
               if self.char() == '\\' {
                  self.next(); // Skip the backslash
                  match self.char() {
                     'n' => value.push('\n'),
                     't' => value.push('\t'),
                     '\\' => value.push('\\'),
                     '"' => value.push('"'),
                     _ => {
                        self.error(format!("\\{} is not a valid escape sequence", self.char()));
                        self.next();
                     }
                  }
               } else if self.char() == '\0' {
                  self.error("eof found before string deliminator '\"'");
                  std::process::exit(1);
               } else {
                  value.push(self.char());
               }
               self.next();
            }
            self.next(); self.push(Class::String, value, index);
         },

         '[' => self.stack(Class::LeftBrace),
         '{' => self.stack(Class::LeftBrack),
         '(' => self.stack(Class::LeftParen),

         ']' => self.stack(Class::RightBrace),
         '}' => self.stack(Class::RightBrack),
         ')' => self.stack(Class::RightParen),

         '.' => self.stack(Class::Dot),
         ',' => self.stack(Class::Comma),
         ':' => self.stack(Class::Colon),
         ';' => self.stack(Class::Semi),

         '+' | '*' | '/' => {
            self.stack(Class::MathAgent);
         }

         '<' | '>' => {
            let mut value = self.char().to_string();
            let index = self.coord; self.next();

            if self.char() == '=' {
               self.next(); value.push('=');
            }

            self.push(Class::BoolAgent, value, index);
         },

         '-' => {
            let index = self.coord.clone();
            self.next();
            if self.char() == '>' {
               self.push(Class::Arrow, "->".to_string(), index); self.next();
            } else {
               self.push(Class::MathAgent, "-".to_string(), index);
            }
         },

         '&' | '|' => self.stack(Class::Logic),

         '!' => {
            let index = self.coord; self.next();
            if self.char() == '=' {
               self.push(Class::BoolAgent, "!=".to_string(), index); self.next();
            } else {
               self.push(Class::Bang, "!".to_string(), index);
            }
         },

         '=' => {
            let index = self.coord;
            self.next();
            if self.char() == '=' {
               self.push(Class::BoolAgent, "==".to_string(), index);
               self.next();
            } else {
               self.push(Class::Assign, "=".to_string(), index)
            }
         }

         ' ' | '\n' => self.next(),

         _ => {
            self.error(format!("unrecognized char {:?}", self.char()));
            self.next();
         }
      };
   }
   pub fn tokenize(&mut self) -> Result<Tokens, String> {
      while self.char() != '\0' && self.index < self.source.len()
         { self.scan(); }       
      self.stack(Class::Eof);

      if self.errors.len() >= 1 {
         return Err(self.errors.join("\n"))
      } else {
         return Ok(self.tokens.clone());
      }
   }
}