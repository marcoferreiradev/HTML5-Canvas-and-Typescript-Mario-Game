export type Coords = {
  x: number;
  y: number;
}

export type Position = Coords;
export type Velocity = Coords;

export type ObjectGame = Position & {
  image: HTMLImageElement
}

export type ObjectImage = [
  key: string,
  image: HTMLImageElement
]

export type ObjectImageInitialize = [
  key: string,
  image: string
]

export type ObjectsImages = ObjectImageInitialize[]

export type PressControls = {
  right: {
    pressed: boolean
  }
  left: {
    pressed: boolean
  }
}