use std::collections::VecDeque;

use thiserror::Error;

use self::parser::Token;

pub mod executor;
pub mod parser;
pub mod turtle;

#[allow(clippy::module_name_repetitions)]
#[derive(Error, Debug)]
pub enum LogoError {
    #[error("undefined expression: `{0}`")]
    UndefinedExpression(String),

    #[error("no such operator: `{0}`")]
    NoSuchOperator(String),

    #[error("no such parameter: `{0}`")]
    UndefinedParameter(String),

    #[error("syntax error: `{err}`\ntokens:\n{tokens:?}")]
    SyntaxError {
        err: String,
        tokens: VecDeque<Token>,
    },
    #[error("runtime budget exceeded: `{0}`")]
    RuntimeBudgetExceeded(usize),

    #[error("recursion budget exceeded: `{0}`")]
    RecursionBudgetExceeded(usize),
}
