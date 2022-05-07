import { WindowLocation } from "@reach/router"
import * as React from "react"
import { PageProps, StaticQueryDocument } from "gatsby"
import { MarkdownRemark } from "./gql"

export type MetaProps = JSX.IntrinsicElements["meta"]
export type LinkProps = JSX.IntrinsicElements["link"]

export type BaseFrontmatter = {
  title: string
  slug: string
  tags: string[]
}

export type DraftFrontMatter = {
  draft: true
}

export type PublicFrontMatter = {
  draft: undefined
  date: string
}

export type CommonFrontmatter = BaseFrontmatter &
  (DraftFrontMatter | PublicFrontMatter)

export type LocalFrontmatter = CommonFrontmatter & {
  site: undefined
}
export type ZennFrontmatter = CommonFrontmatter & {
  site: "zenn"
  canonical: string
  topics: string[]
  emoji: string
  type: "Tech" | "Idea"
}

export type QiitaFrontmatter = CommonFrontmatter & {
  site: "qiita"
  siteTags: string[]
  canonical: string
}
export type Frontmatter = LocalFrontmatter | ZennFrontmatter | QiitaFrontmatter

export type GatsbyPage<
  DataType = object,
  PageContextType = object,
  LocationState = WindowLocation["state"],
  ServerDataType = object
> = React.FC<
  PageProps<DataType, PageContextType, LocationState, ServerDataType>
> & {
  pageQuery?: StaticQueryDocument
}

export type PublicPageInfo = {
  type: "public"
  date: Date
  slug: string
  title: string
  excerpt: string
  tags: string[]
  og: {
    image?: string
    imageTitle?: string
  }
}

export type DraftPageInfo = {
  type: "draft"
  slug: string
  title: string
  excerpt: string
  tags: string[]
  og: {
    image?: string
    imageTitle?: string
  }
}

export type PageInfo = PublicPageInfo | DraftPageInfo

export const remarkToPageInfo = (edge: {
  node: Partial<MarkdownRemark>
}): PageInfo => {
  const type = edge.node.frontmatter?.draft ? "draft" : "public"
  const common = {
    slug: edge.node.frontmatter?.slug ?? "",
    title: edge.node.frontmatter?.title ?? "",
    excerpt: edge.node.excerpt ?? "",
    tags:
      edge.node.frontmatter?.tags?.filter((item): item is string => !!item) ??
      [],
    og: {
      image: undefined,
      imageTitle: edge.node.frontmatter?.ogImageTitle as string | undefined,
    },
  }
  return type === "draft"
    ? {
        type,
        ...common,
      }
    : {
        type,
        ...common,
        date: new Date(edge.node.frontmatter?.date ?? ""),
      }
}

export const ensurePageInfo = (info: Partial<PageInfo>): PageInfo => {
  if (info.type == null) throw Error("cannot determine page info type")
  const common = {
    slug: info.slug ?? "",
    title: info.title ?? "",
    excerpt: info.excerpt ?? "",
    tags: info.tags?.filter((item): item is string => !!item) ?? [],
    og: info.og ?? {},
  }

  if (info.type === "draft") {
    return {
      type: info.type,
      ...common,
    }
  } else {
    return {
      type: "public",
      date: new Date(("date" in info && info.date) || ""),
      ...common,
    }
  }
}
