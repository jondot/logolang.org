use super::parser::{parse, Expression};
use super::turtle::Turtle;
use super::LogoError;
use std::collections::HashMap;

#[derive(Clone)]
pub struct Executor {
    functions: HashMap<String, Function>,
    recursion_budget: usize,
}

impl Executor {
    pub fn new() -> Self {
        Self {
            functions: HashMap::new(),
            recursion_budget: 1000,
        }
    }

    pub fn run(&mut self, turtle: &mut Turtle, logo: &str) -> Result<(), LogoError> {
        let ast = parse(logo)?;
        self.run_ast(ast, turtle, &None, 0)
    }
    fn run_ast(
        &mut self,
        ast: Vec<Expression>,
        turtle: &mut Turtle,
        args: &Option<HashMap<String, f32>>,
        depth: usize,
    ) -> Result<(), LogoError> {
        if depth > self.recursion_budget {
            return Err(LogoError::RecursionBudgetExceeded(self.recursion_budget));
        }
        for e in ast {
            match e {
                Expression::Clear => turtle.clear(),
                Expression::Penup => turtle.pendown = false,
                Expression::Pendown => turtle.pendown = true,
                Expression::Setpos(x, y) => {
                    turtle.position(self.eval_arg(&x, args)?, self.eval_arg(&y, args)?)?;
                }
                Expression::Setcolor(r, g, b) => {
                    turtle.setcolor(self.eval_color(&r, &g, &b, args)?);
                }
                Expression::Forward(arg) => turtle.forward(self.eval_arg(&arg, args)?)?,
                Expression::Back(arg) => turtle.back(self.eval_arg(&arg, args)?)?,
                Expression::Right(arg) => turtle.right(self.eval_arg(&arg, args)?)?,
                Expression::Left(arg) => turtle.left(self.eval_arg(&arg, args)?)?,
                Expression::Arc(x, y) => {
                    turtle.arc(self.eval_arg(&x, args)?, self.eval_arg(&y, args)?)?;
                }
                Expression::Circle(x) => {
                    turtle.circle(self.eval_arg(&x, args)?)?;
                }
                Expression::Setpensize(arg) => turtle.pensize(self.eval_arg(&arg, args)?)?,
                Expression::Repeat(count, exp) => {
                    let n = self.eval_arg(&count, args)?;
                    #[allow(clippy::cast_possible_truncation)]
                    #[allow(clippy::cast_sign_loss)]
                    for _ in 0..n as usize {
                        self.run_ast(exp.clone(), turtle, args, depth)?;
                    }
                }
                Expression::If(condition, exp) => {
                    if self.eval_condition(*condition, args)? {
                        self.run_ast(exp, turtle, args, depth)?;
                    }
                }
                Expression::To(id, args, exp) => self.add_function(id, Function::new(args, exp)),
                Expression::Call(id, params) => {
                    self.call_function(turtle, id.as_str(), &params, args, depth)?;
                }
                _ => {}
            }
        }
        Ok(())
    }

    #[allow(clippy::cast_possible_truncation)]
    #[allow(clippy::cast_sign_loss)]
    fn eval_color(
        &self,
        r: &Expression,
        g: &Expression,
        b: &Expression,
        args: &Option<HashMap<String, f32>>,
    ) -> Result<(u8, u8, u8), LogoError> {
        let r = self.eval_arg(r, args)? as u8;
        let g = self.eval_arg(g, args)? as u8;
        let b = self.eval_arg(b, args)? as u8;

        Ok((r, g, b))
    }

    fn eval_condition(
        &self,
        condition: Expression,
        args: &Option<HashMap<String, f32>>,
    ) -> Result<bool, LogoError> {
        Ok(match condition {
            Expression::Condition(lhs, op, rhs) => {
                let a = self.eval_arg(&lhs, args)?;
                let b = self.eval_arg(&rhs, args)?;
                match *op {
                    Expression::Less => a < b,
                    Expression::Gtr => a > b,
                    Expression::Eq => Self::float_eq(a, b),
                    Expression::Neq => !Self::float_eq(a, b),
                    _ => false,
                }
            }
            _ => false,
        })
    }

    fn float_eq(a: f32, b: f32) -> bool {
        (a - b).abs() < 0.0001
    }

    pub fn eval_arg(
        &self,
        arg: &Expression,
        args: &Option<HashMap<String, f32>>,
    ) -> Result<f32, LogoError> {
        match arg {
            Expression::Number(n) => Ok(*n),
            Expression::Var(id) => Self::eval_var(id, args),
            Expression::Math(lhs, op, rhs) => self.eval_math(lhs, op, rhs, args),
            exp => Err(LogoError::UndefinedExpression(format!("{exp:?}"))),
        }
    }

    fn eval_var(id: &str, args: &Option<HashMap<String, f32>>) -> Result<f32, LogoError> {
        args.as_ref().map_or_else(
            || Err(LogoError::UndefinedParameter(id.to_string())),
            |map| {
                map.get(id).map_or_else(
                    || Err(LogoError::UndefinedParameter(id.to_string())),
                    |id| Ok(*id),
                )
            },
        )
    }

    pub fn eval_math(
        &self,
        lhs: &Expression,
        op: &Expression,
        rhs: &Expression,
        args: &Option<HashMap<String, f32>>,
    ) -> Result<f32, LogoError> {
        let a = self.eval_arg(lhs, args)?;
        let b = self.eval_arg(rhs, args)?;
        match op {
            Expression::Add => Ok(a + b),
            Expression::Sub => Ok(a - b),
            Expression::Mul => Ok(a * b),
            Expression::Div => Ok(a / b),
            exp => Err(LogoError::NoSuchOperator(format!("{exp:?}"))),
        }
    }
    fn add_function(&mut self, ident: String, function: Function) {
        self.functions.insert(ident, function);
    }
    fn call_function(
        &mut self,
        turtle: &mut Turtle,
        ident: &str,
        params: &[Expression],
        args: &Option<HashMap<String, f32>>,
        depth: usize,
    ) -> Result<(), LogoError> {
        let function = self
            .functions
            .get(ident)
            .ok_or_else(|| LogoError::UndefinedExpression(ident.into()))?;
        let exps = function.exps.clone();
        let mut new_args: HashMap<String, f32> = HashMap::new();
        for (exp, ident) in params.iter().zip(function.args.clone()) {
            let n = self.eval_arg(&Box::new(exp.clone()), args)?;
            new_args.insert(ident, n);
        }
        self.run_ast(exps, turtle, &Some(new_args), depth + 1)
    }
}

#[derive(Clone, Debug)]
pub struct Function {
    pub args: Vec<String>,
    pub exps: Vec<Expression>,
}

impl Function {
    fn new(args: Vec<String>, exps: Vec<Expression>) -> Self {
        Self { args, exps }
    }
}
