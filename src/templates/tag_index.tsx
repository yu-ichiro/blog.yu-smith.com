import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import { GatsbyPage } from "../../types"
import { key_to_cmp } from "../lib/cmp"

type TagPageContext = {
  tags: string[]
  postCount: Record<string, number>
}

const Tag: GatsbyPage<{}, TagPageContext> = ({ pageContext }) => (
  <Layout>
    <Seo title="タグ一覧" />
    <h1>タグ一覧</h1>
    <ul>
      {pageContext.tags
        .sort(key_to_cmp((tag: string) => [-pageContext.postCount[tag], tag]))
        .map(tag => (
          <li key={tag}>
            <Link to={`/tag/${tag}`}>
              {tag} ({pageContext.postCount[tag] ?? 0})
            </Link>
          </li>
        ))}
    </ul>
  </Layout>
)

export default Tag
