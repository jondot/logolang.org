export const render = () => {}
function d2r(degrees) {
  const pi = Math.PI
  return degrees * (pi / 180)
}
export class JsCanvasPlotter {
  canvas: CanvasRenderingContext2D
  currentHeading: number
  size: { w: number; h: number }
  currentPos: { x: number; y: number }
  constructor(
    canvas: CanvasRenderingContext2D,
    size: { w: number; h: number }
  ) {
    this.canvas = canvas
    this.size = size
    this.currentHeading = 0.0
    this.currentPos = { x: 0.0, y: 0.0 }
  }

  clear() {
    this.canvas.clearRect(0, 0, this.size.w, this.size.h)
  }

  drawHead(x: number, y: number, angle: number) {
    const size = 8.0
    const span2 = angle + (2.0 * Math.PI) / 3.0
    const span4 = angle + (4.0 * Math.PI) / 3.0

    // Draw the triangle
    this.canvas.beginPath()
    this.canvas.moveTo(size * Math.cos(angle) + x, size * Math.sin(angle) + y)
    this.canvas.lineTo(size * Math.cos(span2) + x, size * Math.sin(span2) + y)
    this.canvas.lineTo(size * Math.cos(span4) + x, size * Math.sin(span4) + y)
    this.canvas.closePath()
    this.canvas.fill()
  }

  plot(commands: any[]) {
    this.clear()
    for (const command of commands) {
      if (command.Move) {
        this.currentPos = { x: command.Move[0], y: command.Move[1] }
      } else if (command.Line) {
        const [from, to] = command.Line
        this.canvas.beginPath()
        this.canvas.moveTo(from[0], from[1])
        this.canvas.lineTo(to[0], to[1])
        this.canvas.stroke()
        this.currentPos = { x: to[0], y: to[1] }
      } else if (command.Heading) {
        this.currentHeading = command.Heading
      } else if (command.Color) {
        const [r, g, b] = command.Color
        this.canvas.strokeStyle = `rgba(${r},${g},${b})`
      } else if (command.Clear) {
        this.clear()
      }
    }

    this.drawHead(
      this.currentPos.x,
      this.currentPos.y,
      d2r(-90.0 + this.currentHeading)
    )
  }
}
