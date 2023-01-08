![](public/logo.svg)

# logolang.org for the brave parent (or talented kid!)

This is the repo behind [https://logolang.org](https://logolang.org) - a free, clean, and open LOGO implementation with a modern twist.

This repo holds the code but also, this README is my best attempt at giving you enough information to contribute back in any possible way, if you'd like to do that.

Meanwhile, you're welcome to open issues for questions or bugs, or open PRs!

# Contributing (non-technical)

Here are some ideas where you can still contribute if you're not technical, or just don't have the time

* [**anyone**] Classic LOGO programs that works for you on `logolang.org` (just open an issue and suggest those)
* [**anyone**] Write some tutorials, docs, and guides based on `logolang.org` to help spread the love
* [**gfx**] Create a nice, colorful help guide for the language for kids (PDF or markdown, or just graphics)
* [**anyone**] Use `logolang.org` in classes or in groups, and share your experience (we'll post it here!)
* [**anyone**]  Fixes: spelling, docs, configuration, styles
* [**anyone**] Bugs (open a ticket)
* [**anyone**] Suggest cool ideas that go with a LOGO variant that you're familiar with (and I was not), or that are completely out of the box and never were in LOGO
* [**anyone**] Anything else I didn't think of!


# Contributing

If you're playing around with `logolang.org` and get new ideas - that's great.

This part is about getting started with if you want to contribute features or fixes, this is for you.

You can contribute if you know _any of these_. You don't have to know all of those:

* Typescript
* React
* CodeMirror - CodeMirror experts are _especially_ needed
* Chakra UI
* Vite
* Rust
* WASM

## Setup

Get the following tools set up:

1. [pnpm](https://pnpm.io/) (and Node.js)
2. [Rust + rustup](https://rustup.rs/)
3. Add wasm target for Rust `rustup target add wasm32-unknown-unknown`


Then go and build:

```
$ cd logolang.org
$ pnpm install
$ pnpm dev
```

Wait a bit, and you should see a hot-replacing server up, and you'll be able to access the app locally on [http://localhost:5173/](http://localhost:5173/)

* Editing the Javascript parts will be hot-replaced, magically updated in an instant.
* Editing the Rust parts will take 3-5 seconds to rebuild and replace (will reload).


## Understanding the codebase

This part is about building and modifying this code for experiments or to contribute features and fixes back.

Though Logo is simple, the language isn't _completely_ trivial. Because of that, this project was engineered with the following tradeoffs:

* Hackability - should be easy to modify
* Extensibility - easy to use this in unexpected ways
* High performance for interactivity - code-to-screen time should be _extremely_ fast. This includes completely parsing, interpreting, rendering, and so on, on each code change.


## Hackability

**There are no servers**. This creates interesting constraints, for example, to allow you to share links with friends that "load" your specific sketch, I had to use an old trick: encode the state of your app on your URL as a hash. But then, I had to also _compress_ it to fit in tweets and such.

Not having any servers makes this project super hackable, you don't need any cloud service, servers, or to pay extra money to hack or deploy it.

The experience I've optimized for is this:

If you're a parent that knows programming, and you're teaching your kid LOGO with this app, once you find something you want to change, you can just go ahead and change it locally, and continue to use it. This way -- you're both having fun :smile:

## Extensibility

Where ever possible, there are **blocks to compose**. For example

* Languages, programs, themes, are all "static" in nature and can be modified and replaced
* Rendering is done in stages: parsing, running, and rendering, and each step is represented separately in a different part/module. You can modify any and each part independent of one another to have crazy experiments

## High performance

Parsing, running, and optionally rendering can all be done in WASM, which gives you 5-10x times the performance over plain Javascript. This gives REAL results in `logolang.org`, from 20% to 40% performance boost, which helps keep all rendering synchronous.

Moving rendering to be async (via webworker and message passing) only made things worse with seamless scrobbling (moving numbers with the pointer) experience -- I've come close but never got the perfect experience.

# Language, styles, and other statics

This is a great starter for those of you who want to experiment without much of a cost or learning curve.

* **Language packs**: a moment before sending logo code to the interpreter, we _transpile_ the code from the editor. This is the perfect place to do some string replacements and store the replacement in a thing fondly named: _language packs_. The packs are located in [dict.json](src/dict.json).
* **Language dialect**: think you have a complete new idea for how Logo should look like? you can modify [transpilation.ts](src/transpilation.ts) and go crazy. As long as what comes out of it is standard Logo, you're good.
* **Styles**: styles and themes are in [styles.ts](src/styles.ts), note that a _theme_ is how logolang.org sees the things you can tweak, and they map to the various _styles_ such as the editor style, app, and canvas and more. To add a style, just edit and add your own to the _themes_ array.
* **Toolbar**: think you have some cool comand to add? add it to [toolbar.tsx](src/toolbar.tsx). Take note of the physical space left for the toolbar.
* **Storage**: you can look at [store.ts](src/store.ts) to understand what's being stored locally and in what format

# The things you don't see (but still happen)


General architecture:

```


       js-side        wasm side
                 ┌─────────────────────────────────┐
                 │                                 │
       ┌──────┐  │   ┌──────┐     ┌──────┐         │
       │      │code  │parse,│     │turtle│         │
       │editor├──┼──►│interp├────►│(ctx) │         │
       │      │  │   │      │     │      │         │
       └──────┘  │   └──────┘     └──┬───┘         │
                 │                   │             │
                 │                   ▼             │
                 │               ┌─────────────┐   │
                 │               │commands(vec)│   │
                 │               └───┬─────────┘   │
                 │                   │             │
                 │                   ▼             │
                 │                ┌─────────────┐  │
                 │                │2d           │  │
                 │                │canvas render│  │
                 │                └─────────────┘  │
                 │                                 │
                 └─────────────────────────────────┘


```


* Every time you type, the entire code is sent through this pipline, rendering into the canvas from scratch. This typically takes less than or in the order of *1ms* for linear, simple programs.
* For recursive, generative art programs this can go as high as 40ms or 200ms for complex ones.

## The Rust side

The interpreter, and the embedded canvas renderer are built in Rust.
Hack around this area if you want to change the core aspects of the language.

In terms of how the flow works _in the Rust/WASM side_:

1. Code is broken to tokens, goes through parsing: [parser.rs](dom-logo/src/logo/parser.rs)
2. Parsed AST "flows through" _Turtle_ which is just a funny name for "Context". This context will gather up all of the _commands_ which are low-level constructs for drawing (think: IR/intermediate representation): [executor.rs](dom-logo/src/logo/executor.rs), [turtle.rs](dom-logo/src/logo/turtle.rs). No drawing happens yet.
3. When running the code finished, the set of low-level commands from `Turtle` (order of 100k commands isn't unheard of) is shipped out to the renderer as an array: [canvas_plotter.rs](dom-logo/src/canvas_plotter.rs)
4. The renderer will render into a canvas using basic constructs such as _line_to_, _arc_, _move_, and other basic drawing commands. At this point _there is no notion_ of functions, recursion, or any high level concept of the language.

Separating running and rendering opens up a world of hacking experiments yet to be done (more on this later).

## The Javascript side

The app is built using:

* React
* Chakra UI
* Zustand
* CodeMirror (as the editor)

The react/reactivity aspects are highly optimized for:

* Type-render-loop (editing code in real time)
* Scrobble-render-loop (modifiying a number by dragging)
 
Memoization and pushing state down the tree is carefully verified, to avoid needless re-rendering with React hooks (which is easy to bump into), and to give the synchronous rendering in the canvas as much headspace as possible.

Ideally this whole thing woudn't be implemented with React at all to completely control browser redraw. But there's some producitivty I can't yet give up with taking Zustand, Chakra, and React in.

### Special notes

**Storage**
State is stored in localstore, **as well as** on your URL hash: [store.ts](src/store.ts) and is dual-sync'd to both.

* While editing code, you get realtime reactivity, but also persistence. 
* The current edited code will be _copied over_ to the store every 2 seconds of key silence, given a pause (debounced), to avoid trashing your browser history with every time you type.
* Your persisted state in the URL, which consists mostly of code is: serialized -> zipped (clientside zip impl.)  -> base64 encoded


## Hacking Ideas

For those who want to go into uncharted territories, there's plenty to experiment with.

### Wasm API

The API provides two main methods:

* **draw** - parse, interpret, run, and draw directly. Don't return anything to avoid interop, return just a general form of result or error.
* **run** - parse, interpret, run, and return the set of commands (sort of IR / gcode like commands), for when the caller takes ownership of rendering. For a simple program, this can be hundreds of commands in an array, such as `Move`, `Line`, `Arc` and `Color`. For complex programs this can be a hundred-thousand commands easy (that's 100k) -- this is a LOT of text to move around between js/WASM for every press of a key (but hey, it works fast enough!).

One easy hacking idea is to build an optimizing folding step for the pipeline that takes a `Vec<Command>` and returns an equal or smaller sized `Vec<Command>`.

For example, these two consecutive moves, assuming current position `(x0, y0)`:

```
Move(x1,y1),
Move(x2,y2),
```

Given that `(x1,y1)` and `(x2,y2)` are linear, can translate to:

```
Move(x3, y3)
```

Where `(x0, y0)`-`(x3,y3)`  will create the one straight line, without segments.

Similarly with turning:

```
Right(40),
Left(10)
```

Will always be (40-10):

```
Right(30)
```

Eliminating one command.


### The Rust API

If you ignore the WASM infrastructure, and take just the Rust code, you get a pretty decent Logo system. You can compose your own stack, and build a nice CLI or another kind of program to run Logo code very easily.

### Making use of "rendering" commands
Because of the fact that you can get pure commands from the interpreter (without drawing) you can imagine some new exciting projects to work on such as:

* A robot taking commands and physically moving on the ground
* A multi-player like environment where commands are shipped off-computer for collaboration
* A pen plotter executing these commands (this is not unlike gcode for ordinary plotters)

### Building alternative renderers
For reference, there's also a Javascript-side renderer, in which case the architecture would look like:

```

   js-side        wasm side
             ┌─────────────────────────────────┐
             │                                 │
   ┌──────┐code  ┌──────┐     ┌──────┐         │
   │      │  │   │      │     │turtle│         │
   │editor├──┼───┤interp├────►│      │         │
   │      │  │   │      │     │      │         │
   └──────┘  │   └──────┘     └──┬───┘         │
             │                   │             │
             │                   │             │
   ┌──────┐  │               ┌───┴─────────┐   │
   │render│◄─┼───────────────┤commands     │   │
   │(js)  │  │               └─────────────┘   │
   └──┬───┘  │                                 │
      │      └─────────────────────────────────┘
      ▼
  ┌──────────┐
  │canvas    │
  │          │
  └──────────┘
```

The Javascript based renderer is slower, and isn't used, but it's a good reference point if you want to build:

* A javascript only renderer
* An animation-ready renderer
* A time-travel renderer (store all the commands, just play them in or out of order)
