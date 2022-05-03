import type { GatsbyNode } from "gatsby"
import path from "path"
import { GatsbyNodeQuery, MarkdownRemarkEdge } from "./gql"
import { Frontmatter, remarkToPageInfo } from "./types"

const graphql = String.raw

export const createPages: GatsbyNode["createPages"] = async ({
  graphql: getGraphql,
  actions,
}) => {
  const { createPage } = actions
  const postPage = path.resolve(`src/templates/post.tsx`)
  const tagPage = path.resolve(`src/templates/tag.tsx`)
  const tagIndexPage = path.resolve(`src/templates/tag_index.tsx`)

  const result = await getGraphql<GatsbyNodeQuery>(graphql`
    query GatsbyNode {
      allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
        edges {
          node {
            id
            excerpt
            frontmatter {
              canonical
              date
              site
              slug
              tags
              title
              topics
              siteTags
              emoji
              type
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const [getTagPosts, setTagPost, getTags] = (() => {
    const _state: Record<string, string[]> = {}
    const set = (tag: string, slug: string) => {
      if (!_state[tag]) _state[tag] = []
      _state[tag].push(slug)
    }
    const get = (tag: string) => {
      return Array.from(_state[tag] ?? [])
    }
    const getTags = () => {
      return Object.keys(_state)
    }
    return [get, set, getTags]
  })()

  const getRelatedPostsForTags = (tags: string[], slug: string) => {
    const posts = tags.reduce((posts, tag) => {
      getTagPosts(tag).forEach(post => {
        if (!posts[post]) posts[post] = 0
        posts[post] += 1
      })
      return posts
    }, {} as Record<string, number>)
    return Object.entries(posts)
      .sort(([_a_post, a_score], [_b_post, b_score]) => {
        return b_score - a_score
      })
      .map(([post, _]) => post)
      .filter(post => post !== slug)
      .slice(0, 5)
  }

  const posts = result.data?.allMarkdownRemark.edges || []
  const slugToEdgeMapping: Record<string, MarkdownRemarkEdge> =
    Object.fromEntries(posts.map(edge => [edge.node.frontmatter?.slug, edge]))
  const globalLatest = posts.slice(0, 6)
  posts
    .map(edge => {
      const slug = edge.node.frontmatter?.slug
      const tags = edge.node.frontmatter?.tags ?? []
      if (!slug) return edge
      tags
        .filter((tag): tag is string => tag != null)
        .forEach(tag => setTagPost(tag, slug))
      return edge
    })
    .forEach((edge, i) => {
      const frontmatter = edge.node.frontmatter
      const tags = frontmatter?.tags ?? []
      const slug = edge.node.frontmatter?.slug
      if (!slug) return

      const prev = posts[i + 1]?.node.frontmatter?.slug
      const next = posts[i - 1]?.node.frontmatter?.slug
      const latest = globalLatest
        .filter(edgeLatest => edgeLatest.node.id !== edge.node.id)
        .map(edge => edge.node.frontmatter?.slug)
        .filter((slug): slug is string => slug != null)
        .slice(0, 5)

      const related = getRelatedPostsForTags(
        tags.filter((tag): tag is string => tag != null),
        slug
      )

      createPage({
        path: `/post/${slug}`,
        component: postPage,
        context: {
          slug,
          frontmatter: frontmatter as Frontmatter,
          prev: prev && remarkToPageInfo(slugToEdgeMapping[prev]),
          next: next && remarkToPageInfo(slugToEdgeMapping[next]),
          latest: latest
            .map(slug => slugToEdgeMapping[slug])
            .map(remarkToPageInfo),
          related: related
            .map(slug => slugToEdgeMapping[slug])
            .map(remarkToPageInfo),
        },
      })
    })

  const tags = getTags()

  tags.forEach(tag => {
    const posts = getTagPosts(tag)
    if (!posts.length) return

    createPage({
      path: `/tag/${tag}`,
      component: tagPage,
      context: {
        tag,
        posts: posts.map(slug => slugToEdgeMapping[slug]).map(remarkToPageInfo),
      },
    })
  })

  createPage({
    path: `/tags`,
    component: tagIndexPage,
    context: {
      tags,
      postCount: Object.fromEntries(
        tags.map(tag => [tag, getTagPosts(tag).length])
      ),
    },
  })
}
