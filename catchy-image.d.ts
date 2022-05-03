declare module "catchy-image" {
  export type TextStyle = {
    paddingTop: number
    paddingBottom: number
    paddingLeft: number
    paddingRight: number
    fontColor: string
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
      backgroundColor: string
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
  }

  export const generate: (options: Options) => Promise<string>
}
