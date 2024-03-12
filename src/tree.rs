use serde::Serialize;
use crate::token::Token;

#[allow(unused)]
pub type Program = Vec<Statement>;

#[derive(Debug, Serialize)]
#[allow(unused)]
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
#[allow(unused)]
pub enum Expression {
   Literal { value: Token },
   Array { value: Vec<Self> },
   Index { array: Box<Self>, index: Box<Self> },

   Compound { lhs: Box<Self>, rhs: Box<Self>, agent: Token },
   Boolean { lhs: Box<Self>, rhs: Box<Self>, agent: Token },
   Function { name: Token, args: Vec<Self> },
   SubExpr { base: Box<Self>, expr: Box<Self> },

   ArgDefine { name: Token, kind: VarType },
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

#[derive(Debug, Serialize)]
pub struct VarType { base: Token, array: usize }