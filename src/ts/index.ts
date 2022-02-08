import platform from '../img/platform.png';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d') as CanvasRenderingContext2D;

canvas.width = 1024;
canvas.height = 576;

type Coords = {
  x: number;
  y: number;
}

type Position = Coords;
type Velocity = Coords;


const gravity: number = 1.5;

class Player {
  position: Position;
  width: number;
  height: number;
  velocity: Velocity;


  constructor() {
    this.position = {
      x: 100,
      y: 40
    }
    this.width = 30;
    this.height = 30;
    this.velocity = {
      x: 0,
      y: 0
    }
  }

  draw() {
    context.fillStyle = 'red';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    const notInTheBottom: boolean = this.position.y + this.height + this.velocity.y <= canvas.height;

    if (notInTheBottom) {
      this.velocity.y += gravity;
    } else {
      this.velocity.y = 0
    }
  }
}

type PlatformBlock = Position & {
  image: HTMLImageElement
}

class Platform {
  position: Position;
  width: number;
  height: number;
  image: HTMLImageElement;

  constructor({ x, y, image }: PlatformBlock) {
    this.position = {
      x: x,
      y: y
    }
    this.image = image;
    this.width = image.width;
    this.height = image.height;
  }

  draw() {
    context.drawImage(this.image, this.position.x, this.position.y);
  }
}

const platformImage = new Image();
platformImage.src = platform;
platformImage.onload = () => dispatchEvent(new CustomEvent('platform-loaded'))

const player = new Player();
let platforms: Platform[] = [];

addEventListener('platform-loaded', () => {
  platforms = [
    new Platform({
      x: -1,
      y: 470,
      image: platformImage
    }),
    new Platform({
      x: platformImage.width -3,
      y: 470,
      image: platformImage
    })
  ];
})


type PressControls = {
  right: {
    pressed: boolean
  }
  left: {
    pressed: boolean
  }
}

const keys: PressControls = {
  right: {
    pressed: false
  },
  left: {
    pressed: false
  }
}

let scrollOffset = 0;

function animate() {
  requestAnimationFrame(animate);
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height);
  platforms.forEach(platform => {
    platform.draw();
  })
  player.update();

  if (keys.right.pressed && player.position.x < 400) {
    player.velocity.x = 5;
  } else if (keys.left.pressed && player.position.x > 100) {
    player.velocity.x = -5;
  } else {
    player.velocity.x = 0;

    if (keys.right.pressed) {
      scrollOffset += 5;
      platforms.forEach(platform => {
        platform.position.x -= 5
      });
    } else if (keys.left.pressed && scrollOffset >= 0) {
      scrollOffset -= 5;
      platforms.forEach(platform => {
        platform.position.x += 5
      })
    }
  }

  //platform collision detect
  platforms.forEach(platform => {
    const collisionDetectionY = player.position.y + player.height <= platform.position.y;
    const collisionDetectionWithVelocityY = player.position.y + player.height + player.velocity.y >= platform.position.y
    const fallDownLeft = player.position.x + player.width >= platform.position.x;
    const fallDownRight = player.position.x <= platform.position.x + platform.width;

    const intereractionWithPlatform = collisionDetectionY && collisionDetectionWithVelocityY && fallDownLeft && fallDownRight;

    if (intereractionWithPlatform) {
      player.velocity.y = 0;
    }
  })

  if (scrollOffset > 2000) {
    console.log('You win');
  }
}
animate();

addEventListener("keyup", ({ code }) => {
  switch (code) {
    case "KeyA":
      console.log("Left")
      keys.left.pressed = false
      break;
    case "KeyW":
      console.log("Up")
      // player.velocity.y -= 20;
      break;
    case "KeyS":
      console.log("Bottom")
      break;
    case "KeyD":
      console.log("Right")
      keys.right.pressed = false
      break;

    default:
      break;
  }
})

addEventListener("keydown", ({ code }) => {
  switch (code) {
    case "KeyA":
      // console.log("Left")
      keys.left.pressed = true
      break;
    case "KeyW":
      // console.log("Up")
      player.velocity.y -= 30;
      break;
    case "KeyS":
      // console.log("Bottom")
      break;
    case "KeyD":
      // console.log("Right")
      keys.right.pressed = true
      break;

    default:
      break;
  }
})