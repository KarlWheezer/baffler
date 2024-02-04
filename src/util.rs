use std::fmt::Display;
use crate::{parser::Parser, token::Token};

#[allow(non_camel_case_types)]
pub type syntax<'a> = (&'a[&'a str], usize);

pub fn fmt(syntax: syntax) -> String {
   let mut buffer = vec![];
   for i in 0..syntax.0.len() {
      match i == syntax.1 {
         true => buffer.push(syntax.0[i].colorize(7)),
         false => buffer.push(syntax.0[i].to_string())
      }
   } return buffer.join(" ");
}

pub trait Colorize<T> {
   fn colorize(&self, num: usize) -> String;
}
impl<S> Colorize<S> for S where S:Display {
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

pub trait WithError<X> {
   type Output;
   fn with_error<Y>(self, p: &Parser, error: X, info: Y) -> Self::Output where Y:Display;
}

impl WithError<syntax<'_>> for Result<Token, Token> {
   type Output = Token;

   fn with_error<Y>(self, p: &Parser, error: syntax, info: Y) -> Self::Output where Y:Display {
      if self.is_ok()
         { return self.unwrap() }
      let value = self.unwrap_err();
      
      Parser::err(&value, info, fmt(error), p.info());

      return value;
   }
}

impl WithError<(&'_[&'_[&'_ str]], Vec<[usize; 2]>)> for Result<Token, Token> {
   type Output = Token;

   fn with_error<Y>(self, p: &Parser, error: (&[&[&str]], Vec<[usize; 2]>), info: Y) -> Self::Output where Y:Display {
      if self.is_ok()
         { return self.unwrap() }
      let value = self.unwrap_err();

      let mut full_syntax = vec![];
      for i in 0..error.1.len() {
         let arr = error.0[error.1[i][0]];
         full_syntax.push(fmt((arr, error.1[i][1])));
      }

      let mut line = "".to_string();
      for _ in 0..value.index[0].to_string().len() {
         line.push(' ');
      }
      
      Parser::err(&value, info, full_syntax.join(&format!("\n{} |   or: ", line)), p.info());

      return value;
   }
}