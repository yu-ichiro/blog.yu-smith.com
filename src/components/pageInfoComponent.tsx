import * as React from "react"
import { PageInfo } from "../../types"
import { Link } from "gatsby"
import { Tags } from "./tags"

export const PageInfoComponent: React.FC<{ pageInfo: PageInfo }> = ({
  pageInfo,
}) => {
  const permalink = `/post/${pageInfo.slug}`
  return (
    <section style={{ paddingBottom: "2rem" }}>
      <h2 style={{ margin: 0, paddingBottom: ".75rem" }}>
        <Link style={{ textDecoration: "none", color: "inherit" }} to={permalink}>
          {pageInfo.title}
        </Link>
      </h2>
      <p style={{ margin: 0, paddingBottom: ".5rem" }}>
        {pageInfo.date.toLocaleDateString()}
      </p>
      <Tags tags={pageInfo.tags} />
      <p style={{ margin: 0 }}>{pageInfo.excerpt}</p>
      <Link to={permalink}>続きを読む</Link>
    </section>
  )
}
