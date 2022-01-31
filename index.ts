const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d') as CanvasRenderingContext2D;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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


  constructor(){
    this.position = {
      x: 40,
      y: 40
    }
    this.width = 30;
    this.height = 30;
    this.velocity = {
      x: 0,
      y: 0
    }
  }

  draw(){
    context.fillStyle = 'red';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update(){
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    
    const notInTheBottom: boolean = this.position.y + this.height + this.velocity.y <= canvas.height;
    
    if(notInTheBottom) {
      this.velocity.y += gravity;
    } else {
      this.velocity.y = 0 
    }
  }
}

class Platform {
  position: Position;
  width: number;
  height: number;

  constructor(){
    this.position = {
      x: 200,
      y: 150
    }
    this.width = 200;
    this.height = 20;
  }

  draw(){
    context.fillStyle = 'blue';
    context.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

const player =  new Player();
const platform = new Platform();

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

function animate(){
  requestAnimationFrame(animate);
  context.clearRect(0, 0, canvas.width, canvas.height);
  player.update();
  platform.draw();

  if(keys.right.pressed){
    player.velocity.x = 5;
  } else if(keys.left.pressed) {
    player.velocity.x = -5;
  } else player.velocity.x = 0;

  //platform collision detect
  const collisionDetectionY = player.position.y + player.height <= platform.position.y;
  const collisionDetectionWithVelocityY = player.position.y + player.height + player.velocity.y >= platform.position.y
  const fallDownLeft = player.position.x + player.width >= platform.position.x;
  const fallDownRight = player.position.x <= platform.position.x + platform.width;

  const intereractionWithPlatform = collisionDetectionY && collisionDetectionWithVelocityY && fallDownLeft && fallDownRight;

  if(intereractionWithPlatform) {
    player.velocity.y = 0;
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
      console.log("Left")
      keys.left.pressed = true
      break;
    case "KeyW":
      console.log("Up")
      player.velocity.y -= 20;
      break;
    case "KeyS":
      console.log("Bottom")
      break;
    case "KeyD":
      console.log("Right")
      keys.right.pressed = true
      break;
  
    default:
      break;
  }
})