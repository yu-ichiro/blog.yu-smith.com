declare module "catchy-image" {
  import { Canvas } from "canvas"

  export type Context = ReturnType<Canvas['getContext']>
  export type Color = string | CanvasGradient | CanvasPattern
  export type ColorFn = (ctx: Context) => Color

  export type TextStyle = {
    paddingTop: number
    paddingBottom: number
    paddingLeft: number
    paddingRight: number
    fontColor: Color | ColorFn
    fontWeight: string
    fontSize: number
    fontFamily: string
  }

  export type Options = {
    meta: {
      title: string
      author: string
    }
    iconFile: string
    image: {
      width: number
      height: number
      backgroundColor: Color | ColorFn
      backgroundImage?: string
    }
    style: {
      title: TextStyle
      author: TextStyle
    }
    output: {
      directory?: string
      fileName: string
    }
    timeout?: number
    fontFile?: {
      path: string
      family: string
      weight?: string
    }[]
    preProcess?: (ctx: Context) => void
    postProcess?: (ctx: Context) => void
    skipBackground?: boolean
    skipTitle?: boolean
    skipAuthor?: boolean
  }

  export const generate: (options: Options) => Promise<string>
}
