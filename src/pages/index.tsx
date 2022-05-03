import * as React from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"
import { GatsbyPage, remarkToPageInfo } from "../../types"
import { IndexPageQuery } from "../../gql"
import { graphql } from "gatsby"
import { PageInfoComponent } from "../components/pageInfoComponent"

const IndexPage: GatsbyPage<IndexPageQuery> = ({ data }) => (
  <Layout>
    <Seo title="Home" />
    {data.allMarkdownRemark.edges.map(remarkToPageInfo).map(info => (
      <PageInfoComponent pageInfo={info} key={info.slug} />
    ))}
  </Layout>
)

export const pageQuery = IndexPage.pageQuery = graphql`
  query IndexPage {
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: [DESC] }) {
      edges {
        node {
          excerpt
          frontmatter {
            date
            title
            slug
            tags
          }
        }
      }
    }
  }
`

export default IndexPage
