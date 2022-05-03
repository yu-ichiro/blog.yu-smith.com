import path from "path"
import * as fs from "fs"
import { PageInfo } from "./types"
import * as catchy from "catchy-image"


const logger = {
  info: console.info,
  warn: console.warn,
  error: console.error,
}


export const generate = async (posts: PageInfo[]) => {
  const imagesDirPath = path.resolve("public/images")

  logger.info("[gatsby-generate] starting image generation")
  fs.mkdirSync(imagesDirPath, { recursive: true })

  const iconFilePath = path.resolve("src/assets/images", "icon.png")

  const fontMain = {
    path: path.resolve("src/assets/fonts", "KleeOne-SemiBold.ttf"),
    family: "Klee One",
    weight: "bold",
  }

  const fontSub = {
    path: path.resolve("src/assets/fonts", "KleeOne-Regular.ttf"),
    family: "Klee One",
    weight: "normal",
  }

  logger.info("[gatsby-generate] writing og images")
  const total = posts.length
  const _cache: Record<string, number> = {}
  return await Promise.all(
    posts.map(info =>
      catchy.generate({
        fontFile: [
          fontMain,
          fontSub,
        ],
        iconFile: iconFilePath,
        image: { backgroundColor: "#15202B", height: 630, width: 1200 },
        meta: { author: "@yu-ichiro", title: info.og.imageTitle || info.title },
        style: {
          title: {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 32,
            paddingRight: 32,
            fontWeight: fontMain.weight,
            fontSize: 64,
            fontFamily: fontMain.family,
            fontColor: "#1DA1F2",
          },
          author: {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            fontWeight: fontSub.weight,
            fontSize: 42,
            fontFamily: fontSub.family,
            fontColor: "#DDDDDD",
          },
        },
        output: {
          directory: imagesDirPath,
          fileName: `${info.slug}.png`,
        },
      })
    ).map(promise => promise.then(path => {
      _cache[path] = 1
      const count = Object.keys(_cache).length
      logger.info(`[gatsby-generate] generated: ${path} (${count} / ${total})`)
    }))
  ).then(() => {
    logger.info(`[gatsby-generate] completed`)
  })
}
