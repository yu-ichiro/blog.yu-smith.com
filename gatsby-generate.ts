import path from "path"
import * as fs from "fs"
import { PageInfo } from "./types"
import * as catchy from "catchy-image"
import { ColorFn } from "catchy-image";


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
    path: path.resolve("src/assets/fonts", "MPLUS1p-Medium.ttf"),
    family: "main",
    weight: "bold",
  }

  const fontSub = {
    path: path.resolve("src/assets/fonts", "MPLUS1p-Regular.ttf"),
    family: "sub",
    weight: "normal",
  }

  logger.info("[gatsby-generate] writing og images")
  const total = posts.length + 1
  const _cache: Record<string, number> = {}

  const gradientFn: ColorFn = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 630)

    gradient.addColorStop(0, "#574cf1")
    gradient.addColorStop(.2, "#574cf1")
    gradient.addColorStop(.2, "#ffffff")
    gradient.addColorStop(1, "#ffffff")

    return gradient
  }

  return await Promise.all(
    posts
      .map(info =>
        catchy.generate({
          fontFile: [fontMain, fontSub],
          iconFile: iconFilePath,
          image: {
            backgroundColor: gradientFn,
            height: 630,
            width: 1200,
          },
          meta: {
            author: "@yu-ichiro",
            title: info.og.imageTitle || info.title,
          },
          style: {
            title: {
              paddingTop: 128,
              paddingBottom: 128,
              paddingLeft: 128,
              paddingRight: 128,
              fontWeight: fontMain.weight,
              fontSize: 56,
              fontFamily: fontMain.family,
              fontColor: "#000000",
            },
            author: {
              paddingTop: 0,
              paddingBottom: 0,
              paddingLeft: 0,
              paddingRight: 0,
              fontWeight: fontSub.weight,
              fontSize: 42,
              fontFamily: fontSub.family,
              fontColor: "#333333",
            },
          },
          output: {
            directory: imagesDirPath,
            fileName: `${info.slug}.png`,
          },
          postProcess(ctx) {
            ctx.font = `${fontMain.weight} 64px ${fontMain.family}`
            ctx.fillStyle = "#ffffff"
            ctx.fillText("yuichiro.__blog__", 64, 96)
          }
        })
      )
      .concat([
        catchy.generate({
          skipAuthor: true,
          skipTitle: true,
          fontFile: [fontMain],
          iconFile: "",
          image: {
            backgroundColor: gradientFn,
            height: 630,
            width: 1200,
          },
          meta: {
            author: "",
            title: "",
          },
          style: {
            title: {
              paddingTop: NaN,
              paddingBottom: NaN,
              paddingLeft: NaN,
              paddingRight: NaN,
              fontWeight: "",
              fontSize: NaN,
              fontFamily: "",
              fontColor: "",
            },
            author: {
              paddingTop: NaN,
              paddingBottom: NaN,
              paddingLeft: NaN,
              paddingRight: NaN,
              fontWeight: "",
              fontSize: NaN,
              fontFamily: "",
              fontColor: "",
            },
          },
          output: {
            directory: imagesDirPath,
            fileName: `default.png`,
          },
          postProcess(ctx) {
            const text = "yuichiro.__blog__"

            ctx.font = `${fontMain.weight} 64px ${fontMain.family}`
            ctx.fillStyle = "#000000"
            const measurement = ctx.measureText(text)
            ctx.fillText(
              text,
              (1200 - measurement.width) / 2,
              630 * (.2 + (.8 - (measurement.actualBoundingBoxAscent + measurement.actualBoundingBoxDescent)/630) / 2)
            )
          }
        })
      ])
      .map(promise =>
        promise.then(path => {
          _cache[path] = 1
          const count = Object.keys(_cache).length
          logger.info(
            `[gatsby-generate] generated: ${path} (${count} / ${total})`
          )
        })
      )
  ).then(() => {
    logger.info(`[gatsby-generate] completed`)
  })
}
