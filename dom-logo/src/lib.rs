#![allow(clippy::missing_const_for_fn)]
mod canvas_plotter;
mod logo;
use canvas_plotter::CanvasPlotter;
use logo::executor::Executor;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;

#[wasm_bindgen(start)]
pub fn main() {
    // executed automatically ...
}
#[derive(Debug)]
#[wasm_bindgen(getter_with_clone)]
pub struct Opts {
    pub canvas_id: String,
    pub x: f32,
    pub y: f32,
    pub budget: usize,
}

#[wasm_bindgen]
impl Opts {
    #[allow(clippy::new_without_default)]
    #[wasm_bindgen(constructor)]
    #[must_use]
    pub fn new() -> Self {
        Self {
            canvas_id: String::new(),
            x: 0.0,
            y: 0.0,
            budget: 130_000,
        }
    }
}

/// run and spit out IR commands
///
#[wasm_bindgen]
pub fn run(opts: &Opts, code: &str) -> Result<JsValue, JsValue> {
    let mut exec = Executor::new();
    let mut tt = logo::turtle::Turtle::new((opts.x, opts.y), opts.budget);
    match exec.run(&mut tt, code) {
        Ok(_) => {
            let cmds = tt.commands();
            JsValue::from_serde(&cmds).map_err(|err| format!("error: {err:?}").into())
            // console::log_1(&format!("{cmds:?}").into());
        }
        Err(err) => Err(format!("{err:?}").into()),
    }
}

/// draw direct to canvas
///
/// # Panics
///
/// Panics if dom ops are invalid
///
/// # Errors
///
/// This function will return an error if .
#[wasm_bindgen]
pub fn draw(opts: &Opts, code: &str) -> Result<(), JsValue> {
    //console::log_1(&format!("opts: {opts:?}").into());
    let document = web_sys::window().unwrap().document().unwrap();
    let canvas = document.get_element_by_id(&opts.canvas_id).unwrap();
    let canvas: web_sys::HtmlCanvasElement = canvas
        .dyn_into::<web_sys::HtmlCanvasElement>()
        .map_err(|_| ())
        .unwrap();

    let context = canvas
        .get_context("2d")
        .unwrap()
        .unwrap()
        .dyn_into::<web_sys::CanvasRenderingContext2d>()
        .unwrap();

    let mut exec = Executor::new();
    let mut tt = logo::turtle::Turtle::new((opts.x, opts.y), opts.budget);
    match exec.run(&mut tt, code) {
        Ok(_) => {
            let cmds = tt.commands();
            /*
            console::log_1(
                &format!("render into: ({},{})", canvas.width(), canvas.height()).into(),
            );
            */
            let mut plotter = CanvasPlotter::new(&context, (canvas.width(), canvas.height()));
            plotter.plot(&cmds);

            Ok(())
            // console::log_1(&format!("{cmds:?}").into());
        }
        Err(err) => Err(format!("{err:?}").into()),
    }
}
