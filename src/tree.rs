use std::{fmt::write, path::Display};

use serde::Serialize;

use crate::token::Token;

#[derive(Debug, Serialize)]
pub enum Statement {
   FunDefine { name: Token, args: Vec<Expression>, pass: Expression, block: Vec<Self> },

   SetAssign { name: Token, value: Expression },
   VarAssign { name: Token, value: Expression },
   ModifyVar { name: Token, value: Expression },

   ImportPkg { package: Token },
   Expression { expr: Expression },

   Void
}
#[derive(Debug, Serialize)]
pub enum Expression {
   Literal { value: Token },
   Array { value: Vec<Self> },
   Index { array: Box<Self>, index: Box<Self> },

   Compound { lhs: Box<Self>, rhs: Box<Self>, agent: Token },
   Boolean { lhs: Box<Self>, rhs: Box<Self>, agent: Token },
   Function { name: Token, args: Vec<Self> },
   SubExpr { base: Box<Self>, expr: Box<Self> },

   ArgDefine { name: Token, value: Box<Self> },
   Type { base: Token, arrays: usize },

   Null
}

impl std::fmt::Display for Expression {
   fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
      write!(f, "{}", serde_json::to_string_pretty(self).unwrap())
   }
}
impl std::fmt::Display for Statement {
   fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
      write!(f, "{}", serde_json::to_string_pretty(self).unwrap())
   }
}

pub struct Syntax;
impl Syntax {
   pub const EXPR: &'_ [&'static [&'static str]] = &[
      &["{literal}"],
      &["[", "{expression}","]"],
      &["{expression}", "[", "{expression}", "]"],
   
      &["{expression}", "{arithmetic-operator}", "{expression}"],
      &["{expression}", "{comparison-operator}", "{expression}"],
      &["{identifier}", "(", "{expression-list}", ")"],
      &["{expression}", ":", "{expression}"],
   
      &["{identifier}", ":", "{expression-type}"],
      &["{identifier}", "[]"]
   ];
   pub const NODE: &'_ [&'static [&'static str]] = &[
      &["fun", "{identifier}", "(", "{argdef-list}", ")", "->", "{identifier}", "{", "...", "}"],
      &["set", "{identifier}", "=", "{expression}", ";"],
      &["var", "{identifier}", "=", "{expression}", ";"],
      &["{identifier}", "=", "{expression}", ";"],
      &["use", "{identifier}", ";"],
      &["{expression}", ";"]
   ];
}