#![allow(clippy::cast_possible_truncation)]
#![allow(clippy::cast_precision_loss)]

use serde::Serialize;

use super::LogoError;
#[allow(dead_code)]
#[derive(Debug, Clone, Serialize)]
pub enum Command {
    Clear,
    Color((u8, u8, u8)),
    Heading(f32),
    Circle(f32),
    Arc(f32, f32),
    Pensize(f32),
    Line((f32, f32), (f32, f32)),
    Move((f32, f32), (f32, f32)),
}

#[derive(Clone)]
pub struct Turtle {
    pub commands: Vec<Command>,
    pub position: (f32, f32),
    pub angle: f32,
    pub pendown: bool,
    pub budget: usize,
}

impl Turtle {
    pub fn new(position: (f32, f32), budget: usize) -> Self {
        Self {
            position,
            commands: vec![Command::Move((0.0, 0.0), position)],
            angle: 0.0,
            pendown: true,
            budget,
        }
    }

    pub fn clear(&mut self) {
        self.commands.push(Command::Clear);
    }

    pub fn setcolor(&mut self, c: (u8, u8, u8)) {
        self.commands.push(Command::Color(c));
    }

    pub fn forward(&mut self, n: f32) -> Result<(), LogoError> {
        self.guard_budget()?;

        let rads = self.angle.to_radians();
        let x = rads.sin().mul_add(n, self.position.0);
        let y = rads.cos().mul_add(-n, self.position.1);
        if self.pendown {
            self.commands.push(Command::Line(self.position, (x, y)));
        } else {
            self.commands.push(Command::Move(self.position, (x, y)));
        }
        self.position = (x, y);
        Ok(())
    }

    pub fn back(&mut self, n: f32) -> Result<(), LogoError> {
        self.forward(-n)
    }

    pub fn right(&mut self, n: f32) -> Result<(), LogoError> {
        self.guard_budget()?;

        self.angle = (((self.angle + n).floor() as i32) % 360) as f32;
        self.commands.push(Command::Heading(self.angle));
        Ok(())
    }

    pub fn left(&mut self, n: f32) -> Result<(), LogoError> {
        self.right(-n)
    }

    pub fn commands(&self) -> Vec<Command> {
        self.commands.clone()
    }

    pub(crate) fn position(&mut self, x: f32, y: f32) -> Result<(), LogoError> {
        self.guard_budget()?;
        self.commands.push(Command::Move(self.position, (x, y)));
        Ok(())
    }

    pub(crate) fn arc(&mut self, angle: f32, radius: f32) -> Result<(), LogoError> {
        self.guard_budget()?;
        self.commands.push(Command::Arc(angle, radius));
        Ok(())
    }

    pub(crate) fn circle(&mut self, rad: f32) -> Result<(), LogoError> {
        self.guard_budget()?;
        self.commands.push(Command::Circle(rad));
        Ok(())
    }

    pub(crate) fn pensize(&mut self, s: f32) -> Result<(), LogoError> {
        self.guard_budget()?;
        self.commands.push(Command::Pensize(s));
        Ok(())
    }

    fn guard_budget(&self) -> Result<(), LogoError> {
        if self.commands.len() > self.budget {
            return Err(LogoError::RuntimeBudgetExceeded(self.budget));
        }
        Ok(())
    }
}
