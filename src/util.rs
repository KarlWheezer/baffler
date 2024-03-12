use std::fmt::Display;

use crate::token::Token;


pub trait Colorize {
   fn colorize(&self, num: usize) -> String;
}
impl<S> Colorize for S where S:Display {
   fn colorize(&self, num: usize) -> String {
      return format!("\x1b[{}m{}\x1b[0m", num, self.to_string());
   }
}

pub trait Split {
   fn split(&self, seq: char) -> Vec<String>;
}
impl<S> Split for S where S:ToString {
   fn split(&self, seq: char) -> Vec<String> {
      let mut array: Vec<String> = vec![];
      let mut buffer = "".to_string();

      for ch in self.to_string().chars().collect::<Vec<char>>() {
         match ch == seq {
            true => {array.push(buffer); buffer = "".to_string() },
            false => buffer.push(ch)
         }
      } array.push(buffer); return array;
   }
}

pub trait WithError {
   type Output;
   fn with_error<S:Display>(self, value: S) -> Self::Output;
}