use crate::logo::turtle::Command;
use std::{f32::consts::PI, f64};
use web_sys::CanvasRenderingContext2d;
pub struct CanvasPlotter<'a> {
    context: &'a CanvasRenderingContext2d,
    current_heading: f32,
    size: (u32, u32),
    current_pos: (f32, f32),
}

impl<'a> CanvasPlotter<'a> {
    /// Creates a new [`CanvasPlotter`].
    pub fn new(context: &'a CanvasRenderingContext2d, size: (u32, u32)) -> Self {
        Self {
            context,
            size,
            current_heading: 0.0,
            current_pos: (0.0, 0.0),
        }
    }
    pub fn plot(&mut self, commands: &[Command]) {
        self.clear();

        for c in commands {
            match c {
                Command::Line((sx, sy), (x, y)) => {
                    self.context.begin_path();
                    self.context.move_to(f64::from(*sx), f64::from(*sy));
                    self.context.line_to(f64::from(*x), f64::from(*y));
                    self.context.stroke();
                    self.current_pos = (*x, *y);
                }
                Command::Move(_, (x, y)) => {
                    self.current_pos = (*x, *y);
                }
                Command::Heading(h) => self.current_heading = *h,
                Command::Color(c) => {
                    self.context
                        .set_stroke_style(&format!("rgba({},{},{})", c.0, c.1, c.2).into());
                }
                Command::Clear => {
                    self.clear();
                }
                Command::Circle(rad) => {
                    self.context.begin_path();
                    let _res = self.context.arc(
                        f64::from(self.current_pos.0),
                        f64::from(self.current_pos.1),
                        f64::from(*rad),
                        0.0f64,
                        2.0 * f64::from(PI),
                    );
                    self.context.stroke();
                }
                Command::Arc(angle, rad) => {
                    self.context.begin_path();
                    let _res = self.context.arc(
                        f64::from(self.current_pos.0),
                        f64::from(self.current_pos.1),
                        f64::from(*rad),
                        f64::from((-90.0 + self.current_heading).to_radians()),
                        f64::from(angle.to_radians()),
                    );
                    self.context.stroke();
                }
                Command::Pensize(w) => self.context.set_line_width(f64::from(*w)),
            }
        }

        #[allow(clippy::cast_precision_loss)]
        if self.current_pos.0 < 0.0
            || self.current_pos.1 < 0.0
            || self.current_pos.0 > self.size.0 as f32
            || self.current_pos.1 > self.size.1 as f32
        {
            self.context.set_line_width(4.0);
            self.context
                .stroke_rect(0.0, 0.0, f64::from(self.size.0), f64::from(self.size.1));
            //for white background
        }

        self.draw_head(
            self.current_pos.0,
            self.current_pos.1,
            (-90.0 + self.current_heading).to_radians(),
        );
    }

    fn clear(&self) {
        self.context.set_line_width(1.0);
        self.context
            .clear_rect(0.0, 0.0, f64::from(self.size.0), f64::from(self.size.1));
    }

    fn draw_head(&self, x: f32, y: f32, angle: f32) {
        let size = 9.0f32;
        let span2 = angle - 2.3;
        let span4 = angle + 2.3;

        // Draw the triangle
        self.context.begin_path();
        self.context.line_to(
            f64::from(size.mul_add(angle.cos(), x)),
            f64::from(size.mul_add(angle.sin(), y)),
        );
        self.context.line_to(
            f64::from(size.mul_add(span2.cos(), x)),
            f64::from(size.mul_add(span2.sin(), y)),
        );
        self.context.line_to(
            f64::from(size.mul_add(span4.cos(), x)),
            f64::from(size.mul_add(span4.sin(), y)),
        );
        self.context.close_path();
        self.context.fill();
    }
}
