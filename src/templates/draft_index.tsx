import * as React from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"
import { ensurePageInfo, GatsbyPage, PageInfo } from "../../types";
import { PageInfoComponent } from "../components/pageInfoComponent";

export type DraftIndexPageContext = {
  posts: PageInfo[]
}

const DraftIndex: GatsbyPage<{}, DraftIndexPageContext> = ({ pageContext }) => (
  <Layout>
    <Seo title="下書き一覧" meta={[{ name: "robots", property: "noindex" }]} />
    <h1>下書き一覧</h1>
    <p>下書き状態の記事一覧です。この配下のページの公開はお控えください。</p>
    {pageContext.posts.map(ensurePageInfo).map(info => (
      <PageInfoComponent pageInfo={info} key={info.slug} />
    ))}
  </Layout>
)

export default DraftIndex
