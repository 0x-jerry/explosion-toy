type Updater = (game: Game) => Promise<unknown> | unknown

interface Point {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

class Timer {
  fps = 60

  frame = ~~(1000 / this.fps)

  preTick = performance.now()

  now = performance.now()

  get delta() {
    return this.now - this.preTick
  }

  update() {
    this.preTick = this.now

    this.now = performance.now()
  }

  async tick() {
    const passedTick = performance.now() - this.now

    const ts = this.frame - passedTick

    if (ts <= 0) return

    return new Promise((resolve) => setTimeout(resolve, ts))
  }
}

class GameObject implements Size, Point {
  velocity = {
    x: 0,
    y: 0,
  }

  x = 0
  y = 0

  width = 1
  height = 1

  constructor(x = 0, y = 0) {
    this.x = x
    this.y = y
  }

  /**
   *
   * @param {Game} ctx
   */
  async update(ctx: Game) {
    this.x += this.velocity.x
    this.y += this.velocity.y
  }
}

class GameGroup extends GameObject {
  /**
   * @type {GameObject[]}
   */
  children: GameObject[] = []

  /**
   *
   * @param {Game} ctx
   */
  async update(ctx: Game) {
    for (const item of this.children) {
      await item.update(ctx)
    }
  }
}

class Game {
  timer = new Timer()

  scene = new GameGroup()

  canvas: HTMLCanvasElement

  ctx: CanvasRenderingContext2D = null

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.ctx = this.canvas.getContext('2d')
  }

  loop = async () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.save()

    this.timer.update()
    await this.scene.update(this)

    this.ctx.restore()

    window.requestAnimationFrame(this.loop)
  }
}

// test code

const canvas = document.getElementById('canvas') as HTMLCanvasElement

const width = canvas.width
const height = canvas.height

class Pixel extends GameObject {
  async update(game: Game) {
    if (this.x < 0) {
      this.velocity.x = Math.abs(this.velocity.x)
    } else if (this.x > width) {
      this.velocity.x = -Math.abs(this.velocity.x)
    }

    if (this.y < 0) {
      this.velocity.y = Math.abs(this.velocity.y)
    } else if (this.y > height) {
      this.velocity.y = -Math.abs(this.velocity.y)
    }

    super.update(game)

    const { ctx } = game
    ctx.fillStyle = 'black'
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}

const game = new Game(canvas)

game.loop()

const g = new GameGroup()

const p = new Pixel()

p.width = 4
p.height = 4

p.velocity = {
  x: 4,
  y: 6,
}

g.children.push(p)

game.scene.children.push(g)
