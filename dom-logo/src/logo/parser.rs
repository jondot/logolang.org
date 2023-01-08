// This has to be a PEG parser that keeps track of original source code for
// real error experience for real-time coding.
// Alternatively, a tokenizer like https://github.com/maciejhirsz/logos can be good for that.
// (only incidentally named 'logos', has nothing to do with Logo the language)
//
// Meanwhile kicking off with adapting parser code from ptrkalm/logo_interpreter
//
use crate::logo::LogoError;
use regex::Regex;
use std::collections::VecDeque;

#[derive(Debug, PartialEq, Clone)]
pub enum Token {
    Clear,
    Setpos,
    Penup,
    Pendown,
    Setcolor,
    Setpensize,
    Forward,
    Back,
    Right,
    Left,
    Arc,
    Circle,
    Repeat,
    LBracket,
    RBracket,
    To,
    End,
    Number(f32),
    Ident(String),
    Var(String),
    If,
    Gtr,
    Less,
    Eq,
    Neq,
    Add,
    Sub,
    Mul,
    Div,
}

#[derive(Debug, Clone)]
pub enum Expression {
    Clear,
    Setpos(Box<Expression>, Box<Expression>),
    Penup,
    Pendown,
    Setcolor(Box<Expression>, Box<Expression>, Box<Expression>),
    Setpensize(Box<Expression>),

    Forward(Box<Expression>),
    Back(Box<Expression>),
    Right(Box<Expression>),
    Left(Box<Expression>),
    Arc(Box<Expression>, Box<Expression>),
    Circle(Box<Expression>),

    Repeat(Box<Expression>, Vec<Expression>),
    To(String, Vec<String>, Vec<Expression>),
    Call(String, Vec<Expression>),

    Number(f32),
    Var(String),

    If(Box<Expression>, Vec<Expression>),
    Condition(Box<Expression>, Box<Expression>, Box<Expression>),
    Less,
    Gtr,
    Eq,
    Neq,

    Math(Box<Expression>, Box<Expression>, Box<Expression>),
    Add,
    Sub,
    Mul,
    Div,
}

pub fn parse(code: &str) -> Result<Vec<Expression>, LogoError> {
    let mut tokens = tokenize(code.to_lowercase().as_str());
    to_ast(&mut tokens)
}

fn tokenize(code: &str) -> VecDeque<Token> {
    let mut tokens: VecDeque<Token> = VecDeque::new();
    let regex = Regex::new(r":*[a-zA-Z]+[0-9]?+|-?\d+(\.\d+)?|(\[|\]|!=|==|<|>|\+|-|\*|/)")
        .expect("regex must compile");
    for token in regex.find_iter(code).map(|x| x.as_str()) {
        tokens.push_back(match token {
            "clear" | "cs" => Token::Clear,
            "setpos" => Token::Setpos,
            "penup" | "pu" => Token::Penup,
            "pendown" | "pd" => Token::Pendown,
            "setcolor" | "sc" => Token::Setcolor,
            "setpensize" | "ps" => Token::Setpensize,
            "forward" | "fd" => Token::Forward,
            "circle" | "ci" => Token::Circle,
            "arc" => Token::Arc,
            "back" | "bk" => Token::Back,
            "right" | "rt" => Token::Right,
            "left" | "lt" => Token::Left,
            "repeat" | "rp" => Token::Repeat,
            "[" => Token::LBracket,
            "]" => Token::RBracket,
            "to" => Token::To,
            "end" => Token::End,
            "if" => Token::If,
            ">" => Token::Gtr,
            "<" => Token::Less,
            "==" => Token::Eq,
            "!=" => Token::Neq,
            "+" => Token::Add,
            "-" => Token::Sub,
            "*" => Token::Mul,
            "/" => Token::Div,
            _ => token.parse::<f32>().map_or_else(
                |_| {
                    let string = String::from(token);
                    match string.chars().next().expect("string cannot be empty") {
                        ':' => Token::Var(string),
                        _ => Token::Ident(string),
                    }
                },
                Token::Number,
            ),
        });
    }
    tokens
}

fn to_ast(tokens: &mut VecDeque<Token>) -> Result<Vec<Expression>, LogoError> {
    let mut stack: VecDeque<Token> = VecDeque::new();
    let exps = build(tokens, &mut stack);
    match stack.pop_back() {
        Some(Token::LBracket) => Err(LogoError::SyntaxError {
            err: "Expected closing token ']'.".into(),
            tokens: tokens.clone(),
        }),
        Some(Token::To) => Err(LogoError::SyntaxError {
            err: "Expected closing token 'end'.".into(),
            tokens: tokens.clone(),
        }),
        _ => exps,
    }
}

fn build(
    tokens: &mut VecDeque<Token>,
    stack: &mut VecDeque<Token>,
) -> Result<Vec<Expression>, LogoError> {
    let mut exps = vec![];

    while let Some(next) = tokens.pop_front() {
        match next {
            Token::Clear => exps.push(Expression::Clear),
            Token::Setpos => exps.push(Expression::Setpos(
                Box::new(build_arg(tokens)?),
                Box::new(build_arg(tokens)?),
            )),
            Token::Penup => exps.push(Expression::Penup),
            Token::Pendown => exps.push(Expression::Pendown),
            Token::Setcolor => exps.push(build_set_color(tokens)?),
            Token::Setpensize => {
                exps.push(Expression::Setpensize(Box::new(build_arg(tokens)?)));
            }
            Token::Forward => {
                exps.push(Expression::Forward(Box::new(build_arg(tokens)?)));
            }
            Token::Back => {
                exps.push(Expression::Back(Box::new(build_arg(tokens)?)));
            }
            Token::Right => {
                exps.push(Expression::Right(Box::new(build_arg(tokens)?)));
            }
            Token::Left => {
                exps.push(Expression::Left(Box::new(build_arg(tokens)?)));
            }
            Token::Arc => exps.push(Expression::Arc(
                Box::new(build_arg(tokens)?),
                Box::new(build_arg(tokens)?),
            )),
            Token::Circle => {
                exps.push(Expression::Circle(Box::new(build_arg(tokens)?)));
            }
            Token::Repeat => exps.push(build_repeat(tokens, stack)?),
            Token::If => exps.push(build_if(tokens, stack)?),
            Token::To => exps.push(build_to(tokens, stack)?),
            Token::Ident(x) => exps.push(build_call(tokens, x)?),
            Token::RBracket => {
                pop_stack(&Token::LBracket, &Token::RBracket, stack)?;
                break;
            }
            Token::End => {
                pop_stack(&Token::To, &Token::End, stack)?;
                break;
            }
            _ => {
                return Err(LogoError::SyntaxError {
                    err: format!("Unexpected token '{next:?}'"),
                    tokens: tokens.clone(),
                })
            }
        };
    }

    Ok(exps)
}

fn build_repeat(
    tokens: &mut VecDeque<Token>,
    stack: &mut VecDeque<Token>,
) -> Result<Expression, LogoError> {
    let count = Box::new(build_arg(tokens)?);
    stack.push_back(Token::LBracket);
    match tokens.pop_front() {
        Some(Token::LBracket) => Ok(Expression::Repeat(count, build(tokens, stack)?)),
        Some(other) => Err(LogoError::SyntaxError {
            err: format!("Unexpected token '{other:?}'. Expected '['"),
            tokens: tokens.clone(),
        }),
        None => Err(LogoError::SyntaxError {
            err: "Expected '[', got nothing.".into(),
            tokens: tokens.clone(),
        }),
    }
}

fn build_if(
    tokens: &mut VecDeque<Token>,
    stack: &mut VecDeque<Token>,
) -> Result<Expression, LogoError> {
    let condition = Box::new(build_condition(tokens)?);
    stack.push_back(Token::LBracket);
    match tokens.pop_front() {
        Some(Token::LBracket) => Ok(Expression::If(condition, build(tokens, stack)?)),
        Some(other) => Err(LogoError::SyntaxError {
            err: format!("Unexpected token '{other:?}'. Expected '['"),
            tokens: tokens.clone(),
        }),
        None => Err(LogoError::SyntaxError {
            err: "Expected '[', got nothing.".into(),
            tokens: tokens.clone(),
        }),
    }
}

fn build_to(
    tokens: &mut VecDeque<Token>,
    stack: &mut VecDeque<Token>,
) -> Result<Expression, LogoError> {
    let ident = build_name(tokens)?;
    stack.push_back(Token::To);
    let mut args = vec![];
    while let Some(Token::Var(x)) = tokens.get(0) {
        args.push(x.to_string());
        tokens.pop_front();
    }
    Ok(Expression::To(ident, args, build(tokens, stack)?))
}

fn build_var(tokens: &mut VecDeque<Token>) -> Result<Expression, LogoError> {
    match tokens.pop_front() {
        Some(Token::Number(x)) => Ok(Expression::Number(x)),
        Some(Token::Var(x)) => Ok(Expression::Var(x)),
        x => Err(LogoError::SyntaxError {
            err: format!("no such variable: {x:?}"),
            tokens: tokens.clone(),
        }),
    }
}

fn build_math(tokens: &mut VecDeque<Token>, op: Box<Expression>) -> Result<Expression, LogoError> {
    let lhs = Box::new(build_var(tokens)?);
    tokens.pop_front();
    let rhs = Box::new(build_var(tokens)?);

    Ok(Expression::Math(lhs, op, rhs))
}

fn build_logical_op(tokens: &mut VecDeque<Token>) -> Result<Expression, LogoError> {
    match tokens.pop_front() {
        Some(Token::Less) => Ok(Expression::Less),
        Some(Token::Gtr) => Ok(Expression::Gtr),
        Some(Token::Eq) => Ok(Expression::Eq),
        Some(Token::Neq) => Ok(Expression::Neq),
        Some(other) => Err(LogoError::SyntaxError {
            err: format!("Unexpected token '{other:?}'. Expected logical operator."),
            tokens: tokens.clone(),
        }),
        None => Err(LogoError::SyntaxError {
            err: "Expected logical operator, got nothing.".into(),
            tokens: tokens.clone(),
        }),
    }
}

fn build_name(tokens: &mut VecDeque<Token>) -> Result<String, LogoError> {
    match tokens.pop_front() {
        Some(Token::Ident(x)) => Ok(x),
        Some(x) => Err(LogoError::SyntaxError {
            err: format!("Unexpected token '{x:?}'. Expected identifier."),
            tokens: tokens.clone(),
        }),
        None => Err(LogoError::SyntaxError {
            err: "Expected identifier, got nothing.".into(),
            tokens: tokens.clone(),
        }),
    }
}

fn pop_stack(open: &Token, close: &Token, stack: &mut VecDeque<Token>) -> Result<(), LogoError> {
    stack.pop_back().map_or_else(
        || {
            Err(LogoError::SyntaxError {
                err: format!("Expected opening token '{open:?}' before '{close:?}'."),
                tokens: stack.clone(),
            })
        },
        |token| {
            if token.eq(open) {
                Ok(())
            } else {
                Err(LogoError::SyntaxError {
                    err: format!("Expected opening token '{open:?}' before '{close:?}'."),
                    tokens: stack.clone(),
                })
            }
        },
    )
}

fn build_arg(tokens: &mut VecDeque<Token>) -> Result<Expression, LogoError> {
    let op = tokens.get(1);
    match op {
        Some(Token::Add) => build_math(tokens, Box::new(Expression::Add)),
        Some(Token::Sub) => build_math(tokens, Box::new(Expression::Sub)),
        Some(Token::Mul) => build_math(tokens, Box::new(Expression::Mul)),
        Some(Token::Div) => build_math(tokens, Box::new(Expression::Div)),
        Some(_) | None => build_var(tokens),
    }
}

fn build_set_color(tokens: &mut VecDeque<Token>) -> Result<Expression, LogoError> {
    let r = Box::new(build_arg(tokens)?);
    let g = Box::new(build_arg(tokens)?);
    let b = Box::new(build_arg(tokens)?);
    Ok(Expression::Setcolor(r, g, b))
}

fn build_condition(tokens: &mut VecDeque<Token>) -> Result<Expression, LogoError> {
    Ok(Expression::Condition(
        Box::new(build_arg(tokens)?),
        Box::new(build_logical_op(tokens)?),
        Box::new(build_arg(tokens)?),
    ))
}

fn build_call(tokens: &mut VecDeque<Token>, name: String) -> Result<Expression, LogoError> {
    let mut args = vec![];

    while let Some(Token::Var(_) | Token::Number(_)) = tokens.get(0) {
        args.push(build_arg(tokens)?);
    }

    Ok(Expression::Call(name, args))
}
