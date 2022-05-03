import * as React from "react"
import { ReactNode } from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import { BlogPostBySlugQuery } from "../../gql"
import { Tags } from "../components/tags"
import { ensurePageInfo, Frontmatter, GatsbyPage, LinkProps, PageInfo } from "../../types"
import { PageInfoComponent } from "../components/pageInfoComponent";

type PostContext = {
  frontmatter: Frontmatter
  prev?: PageInfo
  next?: PageInfo
  latest: PageInfo[]
  related: PageInfo[]
}

const Post: GatsbyPage<BlogPostBySlugQuery, PostContext> = ({
  data,
  pageContext,
}) => {
  const date = new Date(pageContext.frontmatter.date)

  const [link, canonicalLink] = ((frontmatter): [LinkProps[], ReactNode] => {
    if (frontmatter.site === "zenn") {
      return [
        [
          {
            rel: "canonical",
            href: frontmatter.canonical,
          },
        ],
        <a href={frontmatter.canonical} target="_blank">
          {frontmatter.emoji} Zennで読む
        </a>,
      ]
    } else if (frontmatter.site === "qiita") {
      return [
        [
          {
            rel: "canonical",
            href: frontmatter.canonical,
          },
        ],
        <a href={frontmatter.canonical} target="_blank">
          Qiitaで読む
        </a>,
      ]
    } else {
      return [[], undefined]
    }
  })(pageContext.frontmatter)

  return (
    <Layout>
      <Seo title={pageContext.frontmatter.title} link={link} slug={pageContext.frontmatter.slug} />
      <header>
        <h1>{pageContext.frontmatter.title}</h1>
        {canonicalLink}
        <p style={{ margin: 0, paddingBottom: ".5rem" }}>{date.toLocaleDateString()}</p>
        <Tags tags={pageContext.frontmatter.tags}/>
      </header>
      <article
        dangerouslySetInnerHTML={{ __html: data.markdownRemark?.html ?? "" }}
      />
      <section style={{ display: "flex", justifyContent: "space-between", gap: "3rem", paddingTop: "1rem", borderTop: "solid 1px rgba(87, 76, 241, .15)" }}>
        { pageContext.next && (
          <Link to={`/post/${pageContext.next.slug}`}>&lt; {pageContext.next.title}</Link>
        ) }
        { pageContext.prev && (
          <Link to={`/post/${pageContext.prev.slug}`}>{pageContext.prev.title} &gt;</Link>
        ) }
      </section>
      { pageContext.related.length == 0 ? null : (
        <section style={{ zoom: "80%", padding: "2rem 0" }}>
          <h2>関連記事</h2>
          {pageContext.related.map(ensurePageInfo).map(info => (
            <PageInfoComponent pageInfo={info} key={info.slug}/>
          ))}
        </section>
      )}
    </Layout>
  )
}

export const pageQuery = Post.pageQuery = graphql`
    query BlogPostBySlug($slug: String!) {
        site {
            buildTime
        }
        markdownRemark(frontmatter: { slug: { eq: $slug } }) {
            html
        }
    }
`

export default Post
