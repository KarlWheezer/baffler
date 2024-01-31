use crate::{parser::Parser, token::Token};

pub trait Colorize<T> {
   fn colorize(&self, num: u8) -> String;
}

impl<T> Colorize<T> for T where T:ToString {
   fn colorize(&self, num: u8) -> String {
      return format!("\x1b[{}m{}\x1b[0m", num, self.to_string());
   }
}

pub trait Then<X, Y> {
   fn then(self, parser: &Parser, info: X, indecies: Y, syntax: &[&'static [&'static str]]) -> Token;
}

impl<X, Y> Then<X, Y> for Result<Token, Token> where X:ToString, Y:ToVec<[usize; 2]>{
   fn then(self, parser: &Parser, info: X, indecies: Y, syntax: &[&'static [&'static str]]) -> Token {
      if self.is_ok() { return self.unwrap(); }
      let token = self.unwrap_err();

      parser.err(token.clone(), info, indecies, syntax);

      return token;
   }
}

pub trait Fmt {
   fn fmt(&self, syntax: &[&[&str]]) -> Vec<String>;
}

impl<T> Fmt for T where T:ToVec<[usize; 2]> {
   fn fmt(&self, syntax: &[&[&str]]) -> Vec<String> {
      let mut outer = vec![];
      for inner in self.to_vec() {
         let mut vec = vec![];

         for i in 0..syntax[inner[0]].len() {
            if i == inner[1]
               { vec.push(syntax[inner[0]][i].colorize(7)); }
            else 
               { vec.push(syntax[inner[0]][i].to_string()); }
         }
   
         outer.push(vec.join(" "));
      }
      return outer;
   }
}

pub trait ToVec<T> {
   fn to_vec(&self) -> Vec<T>;
}

impl ToVec<[usize; 2]> for [usize; 2] {
   fn to_vec(&self) -> Vec<[usize; 2]> {
      return vec![self.clone()];
   }
}

impl ToVec<[usize; 2]> for &[[usize; 2]] {
   fn to_vec(&self) -> Vec<[usize; 2]> {
      return self.iter().cloned().collect();
   }
}

impl ToVec<[usize; 2]> for Vec<[usize; 2]> {
   fn to_vec(&self) -> Vec<[usize; 2]> {
      return self.clone()
   }
}

pub trait Split {
   fn split(&self, seq: char) -> Vec<String>;
}

impl<X> Split for X where X:ToString {
   fn split(&self, seq: char) -> Vec<String> {
      let mut array: Vec<String> = vec![];
      let mut value = String::new();
      let self_as_string: Vec<char> = self.to_string().chars().collect();

      for i in 0..self_as_string.len() {
         if self_as_string[i] == seq
            { array.push(value); value = String::new(); }
         else 
            { value.push(self_as_string[i]); }
      } 
      
      array.push(value); return array;
   }
}