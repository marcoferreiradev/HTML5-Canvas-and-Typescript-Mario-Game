import {
  Position,
  Velocity,
  ObjectGame,
  ObjectImage,
  ObjectsImages,
  PressControls
} from './utils/types';

import platform from '../img/platform.png';
import platformSmallTall from '../img/platformSmallTall.png';
import background from '../img/background.png';
import hills from '../img/hills.png';

const canvas = document.querySelector('canvas') as HTMLCanvasElement;
const context = canvas.getContext('2d') as CanvasRenderingContext2D;

canvas.width = 1024;
canvas.height = 576;

const gravity: number = 1.5;

class Player {
  position: Position;
  width: number;
  height: number;
  velocity: Velocity;
  speed = 6;


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
    }
  }
}
class Platform {
  position: Position;
  width: number;
  height: number;
  image: HTMLImageElement;

  constructor({ x, y, image }: ObjectGame) {
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
class GenericObject {
  position: Position;
  width: number;
  height: number;
  image: HTMLImageElement;

  constructor({ x, y, image }: ObjectGame) {
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

function createImage(keyImage: string, imageSrc: string) {
  return new Promise<ObjectImage>((resolve, reject) => {
    const image: HTMLImageElement = new Image();
    image.src = imageSrc;
    console.log('typeof image', typeof image)
    image.onload = () => resolve([keyImage, image]);
  })
}

const objectImages: ObjectsImages = [
  ['platform', platform],
  ['background', background],
  ['hills', hills],
  ['platformSmallTall', platformSmallTall]
];

let objectImagesElements: {
  [key: string]: HTMLImageElement
};

let player = new Player();
let platforms: Platform[] = [];
let genericObjects: GenericObject[] = [];
let platformReferenceWidth: number;

function init() {
  player = new Player();

  Promise.all(objectImages.map(([keyImage, image]) => {
    return createImage(keyImage, image);
  })).then((values) => {
    objectImagesElements = Object.fromEntries(values);
    dispatchEvent(new CustomEvent('images-loaded'))
  })

  addEventListener('images-loaded', () => {
    const { platform, background, hills, platformSmallTall } = objectImagesElements;
    platformReferenceWidth = platform.width;

    platforms = [
      new Platform({
        x: platform.width * 4 + 300 - 2 + platform.width - platformSmallTall.width,
        y: 270,
        image: platformSmallTall
      }),
      new Platform({
        x: -5,
        y: 470,
        image: platform
      }),
      new Platform({
        x: platform.width - 7,
        y: 470,
        image: platform
      }),
      new Platform({
        x: platform.width * 2 + 100,
        y: 470,
        image: platform
      }),
      new Platform({
        x: platform.width * 3 + 300,
        y: 470,
        image: platform
      }),
      new Platform({
        x: platform.width * 4 + 300 - 2,
        y: 470,
        image: platform
      }),
      new Platform({
        x: platform.width * 5 + 530 - 4,
        y: 470,
        image: platform
      })
    ];
    genericObjects = [
      new GenericObject({
        x: -5,
        y: -1,
        image: background
      }),
      new GenericObject({
        x: 0,
        y: 0,
        image: hills
      })
    ];
  })
  scrollOffset = 0;
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

  genericObjects.forEach(genericObject => {
    genericObject.draw();
  })

  platforms.forEach(platform => {
    platform.draw();
  })
  player.update();

  const walkToRight = keys.right.pressed && player.position.x < 400;
  const walkToLeft = (keys.left.pressed && player.position.x > 100) || 
    (keys.left.pressed && scrollOffset === 0 && player.position.x > 0);

  if (walkToRight) {
    player.velocity.x = player.speed;
  } else if (walkToLeft) {
    player.velocity.x = -player.speed;
  } else {
    player.velocity.x = 0;

    if (keys.right.pressed) {
      scrollOffset += player.speed;
      platforms.forEach(platform => {
        platform.position.x -= player.speed
      });
      genericObjects.forEach(genericObject => {
        genericObject.position.x -= player.speed * 0.66;
      })
    } else if (keys.left.pressed && scrollOffset > 0) {
      scrollOffset -= player.speed;
      platforms.forEach(platform => {
        platform.position.x += player.speed
      })
      genericObjects.forEach(genericObject => {
        genericObject.position.x += player.speed * 0.66;
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

  // Win 
  const lastBlockPosition = platformReferenceWidth * 4 + 200 - 2;
  if (scrollOffset >= lastBlockPosition) {
    console.log('You win');
  }

  // Lose 
  if (player.position.y > canvas.height) {
    console.log('You losee');
    init();
  }
}

init();
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
      player.velocity.y -= 25;
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