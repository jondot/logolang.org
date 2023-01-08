/* eslint-disable no-console */
import { Box } from '@chakra-ui/react'
import { Opts, draw } from 'dom-logo'
import debounce from 'lodash/debounce'
import React, { useEffect, useLayoutEffect, useRef } from 'react'
import { transpile } from './transpilation'
import { useStore } from './store'
// import { JsCanvasPlotter } from './js-canvas-plotter'

const redraw = (code, canvas, theme, onDidDraw) => {
  const context = canvas.getContext('2d')
  context.strokeStyle = theme.foreground
  context.fillStyle = theme.foreground
  const start = window.performance.now()
  const opts = new Opts()
  opts.canvas_id = 'plot'
  opts.x = canvas.width / 2
  opts.y = canvas.height / 2
  opts.budget = 250 * 1000 // 250k instructions are roughly 300ms on mac m1
  // console.log(opts)
  let error = null
  try {
    draw(opts, transpile(code || ''))
    /*
    const commands = run(opts, transpile(code || ''))
    const p = new JsCanvasPlotter(context, {
      w: canvas.width,
      h: canvas.height,
    })
    p.plot(commands)
    */
  } catch (ex) {
    error = ex.toString()
    console.log('err', error)
  }

  const res = { error, time: window.performance.now() - start }
  if (onDidDraw) {
    onDidDraw(res)
  } else {
    console.log('didDraw', res)
  }
}

const Canvas = () => {
  const canvasRef = useRef(null)
  const parentContainerRef = useRef(null)

  const theme = useStore((s) => s.theme)
  const compactCode = useStore((s) => s.codemini)
  const layout = useStore((s) => s.layout)
  const code = useStore((s) => s.localcode)
  const onDidDraw = useStore((s) => s.setResult)

  useLayoutEffect(() => {
    const debouncedRedraw = debounce(redraw, 150)
    function handleResize() {
      const parentContainerRect =
        parentContainerRef.current.getBoundingClientRect()
      canvasRef.current.width = parentContainerRect.width
      canvasRef.current.height = parentContainerRect.height
      canvasRef.current.style.width = parentContainerRect.width
      canvasRef.current.style.height = parentContainerRect.height

      // to optimize reactivity, the window resize serves as our reactive subscriber
      // which is why we should not depend on `code` that comes from a store,
      // or have it in our hook dep list. if we did, we'll get glitchy debouncing,
      // because this hook will get fired every time code changes.
      //
      // so, we get it plainly from a store data instance:
      const code = useStore.getState().localcode

      debouncedRedraw(code, canvasRef.current, theme, onDidDraw)
    }

    // Add the event listener
    window.addEventListener('resize', handleResize)

    // Call the function to set the initial size of the canvas
    setTimeout(() => handleResize(), 1)

    // Remove the event listener when the component unmounts
    return () => window.removeEventListener('resize', handleResize)
  }, [layout, compactCode, theme]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    redraw(code, canvasRef.current, theme, onDidDraw)
  }, [code, theme]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box ref={parentContainerRef} w="100%" h="100%">
      <canvas
        ref={canvasRef}
        style={{
          backgroundColor: theme.background,
        }}
        id="plot"
      />
    </Box>
  )
}

Canvas.displayName = 'Canvas'
Canvas.whyDidYouRender = true

export default React.memo(Canvas)
