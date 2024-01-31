use serde::Serialize;

use crate::token::Token;

#[derive(Debug, Serialize)]
pub enum Statement {
   FunDefine { name: Token, args: Expression, pass: Expression, nodes: Vec<Self> },

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

pub struct Syntax;
impl Syntax {
   pub const EXPR: &'static [&'static [&'static str]] = &[
      &["{literal}"],
      &["[", "{expression}", ",", "]"],
      &["{expression}", "[", "{expression}", "]"],
   
      &["{expression}", "{arithmetic-operator}", "{expression}"],
      &["{expression}", "{comparison-operator}", "{expression}"],
      &["{identifier}", "(", "{expression-list}", ")"],
      &["{expression}", ":", "{expression}"],
   
      &["{identifier}", ":", "{expression-type}"],
      &["{identifier}", "[]"]
   ];
   pub const NODE: &'static [&'static [&'static str]] = &[
      &["fun", "{identifier}", "(", "{argdef-list}", ")", "->", "{identifier}", "{", "...", "}"],
      &["set", "{identifier}", "=", "{expression}", ";"],
      &["var", "{identifier}", "=", "{expression}", ";"],
      &["{identifier}", "=", "{expression}", ";"],
      &["use", "{identifier}", ";"],
      &["{expression}", ";"]
   ];
}