import { WindowLocation } from "@reach/router"
import * as React from "react"
import { PageProps, StaticQueryDocument } from "gatsby"
import { MarkdownRemark } from "./gql"

export type MetaProps = JSX.IntrinsicElements["meta"]
export type LinkProps = JSX.IntrinsicElements["link"]

export type CommonFrontmatter = {
  title: string
  slug: string
  date: string
  tags: string[]
}
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
export type PageInfo = {
  date: Date
  slug: string
  title: string
  excerpt: string
  tags: string[]
}
export const remarkToPageInfo = (edge: {
  node: Partial<MarkdownRemark>
}): PageInfo => {
  return {
    date: new Date(edge.node.frontmatter?.date ?? ""),
    slug: edge.node.frontmatter?.slug ?? "",
    title: edge.node.frontmatter?.title ?? "",
    excerpt: edge.node.excerpt ?? "",
    tags:
      edge.node.frontmatter?.tags?.filter((item): item is string => !!item) ??
      [],
  }
}

export const ensurePageInfo = (info: Partial<PageInfo>): PageInfo => {
  return {
    date: new Date(info.date ?? ""),
    slug: info.slug ?? "",
    title: info.title ?? "",
    excerpt: info.excerpt ?? "",
    tags: info.tags?.filter((item): item is string => !!item) ?? [],
  }
}
