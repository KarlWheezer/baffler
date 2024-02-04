use std::fmt::Display;
use lorust::kebab_case;
use serde::Serialize;
use crate::util::Colorize;

#[derive(Clone, Debug, Serialize)]
pub struct Token {
   pub class: Class,
   pub value: String,
   pub index: [usize; 2]
}
impl Token {
   pub fn new(class: Class, value: String, index: [usize; 2]) -> Self {
      Self { class, value, index }
   }
}
impl Display for Token {
   fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
      write!(f, "Token{{ value: {:?}, class: {}, index: {:?} }}", self.value, self.class, self.index)
      // write!(f, "{}", serde_json::to_string(&self).unwrap())
   }
}


#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub enum Class {
   Identifier, Keyword,
   String, Number, Boolean,

   LeftBrace, RightBrace,
   LeftBrack, RightBrack,
   LeftParen, RightParen,

   Dot, Comma, Semi, Colon,
   MathAgent, BoolAgent, Bang,
   Assign, Arrow, Logic, Eof,
}

impl Serialize for Class {
   fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error> where S: serde::Serializer {
      serializer.serialize_str(&self.to_string())
   }
}

impl Display for Class {
   fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
      write!(f, "{}", kebab_case(format!("{:?}", &self)))
   }
}