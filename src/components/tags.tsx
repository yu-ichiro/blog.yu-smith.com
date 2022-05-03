import * as React from "react"
import { Link } from "gatsby"

export const Tags: React.FC<{ tags: string[] }> = ({tags}) => (
  <ul style={{ margin: 0, display: "flex", justifyContent: "start", listStyleType: "none", gap: ".5rem" }}>
    {tags.map(tag => {
      return (
        <li style={{ display: "block", borderRadius: "5px", backgroundColor: "rgba(87, 76, 241, .2)", padding: ".25rem" }} key={tag}>
          <Link to={`/tag/${tag}`} style={{ textDecoration: "none" }}>{tag}</Link>
        </li>
      )
    })}
  </ul>
)
