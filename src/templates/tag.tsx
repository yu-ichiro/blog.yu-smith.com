import * as React from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"
import { ensurePageInfo, GatsbyPage, PageInfo } from "../../types"
import { PageInfoComponent } from "../components/pageInfoComponent";

export type TagPageContext = {
  tag: string
  posts: PageInfo[]
}

const Tag: GatsbyPage<{}, TagPageContext> = ({ pageContext }) => (
  <Layout>
    <Seo title={`タグ: ${pageContext.tag}`} />
    <h1>タグ: {pageContext.tag} の記事</h1>
    {pageContext.posts.map(ensurePageInfo).map(info => (
      <PageInfoComponent pageInfo={info} key={info.slug} />
    ))}
  </Layout>
)

export default Tag
