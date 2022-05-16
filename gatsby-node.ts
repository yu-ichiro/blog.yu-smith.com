import type { GatsbyNode } from "gatsby"
import path from "path"
import { GatsbyNodeQuery, MarkdownRemarkEdge } from "./gql"
import { Frontmatter, remarkToPageInfo } from "./types"
import { generate } from "./gatsby-generate"
import "./src/lib/arraySplit"

import type { PostPageContext } from './src/templates/post'
import type { TagPageContext } from './src/templates/tag'
import type { TagIndexPageContext } from './src/templates/tag_index'
import type { DraftIndexPageContext } from './src/templates/draft_index'

const graphql = String.raw

export const createPages: GatsbyNode["createPages"] = async ({
  graphql: getGraphql,
  actions,
}) => {
  const { createPage } = actions
  const postPage = path.resolve(`src/templates/post.tsx`)
  const tagPage = path.resolve(`src/templates/tag.tsx`)
  const tagIndexPage = path.resolve(`src/templates/tag_index.tsx`)
  const draftIndexPage = path.resolve(`src/templates/draft_index.tsx`)

  const result = await getGraphql<GatsbyNodeQuery>(graphql`
    query GatsbyNode {
      allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
        edges {
          node {
            id
            excerpt
            frontmatter {
              canonical
              ogImageTitle
              date
              site
              slug
              tags
              title
              topics
              siteTags
              emoji
              type
              draft
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
  const [draftPosts, publicPosts] = posts.split(
    edge => edge.node.frontmatter?.draft === true
  )
  const slugToEdgeMapping: Record<string, MarkdownRemarkEdge> =
    Object.fromEntries(
      publicPosts.map(edge => [edge.node.frontmatter?.slug, edge])
    )
  const globalLatest = publicPosts.slice(0, 6)
  publicPosts
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

      const prev = publicPosts[i + 1]?.node.frontmatter?.slug
      const next = publicPosts[i - 1]?.node.frontmatter?.slug
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
        } as PostPageContext,
      })
    })

  draftPosts.forEach(edge => {
    const frontmatter = edge.node.frontmatter
    const slug = edge.node.frontmatter?.slug
    if (!slug) return

    createPage({
      path: `/post/${slug}`,
      component: postPage,
      context: {
        slug,
        frontmatter: frontmatter as Frontmatter,
        related: [],
        latest: [],
      } as PostPageContext,
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
      } as TagPageContext,
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
    } as TagIndexPageContext,
  })

  if (draftPosts.length > 0) {
    createPage({
      path: `/drafts`,
      component: draftIndexPage,
      context: {
        posts: draftPosts.map(remarkToPageInfo),
      } as DraftIndexPageContext,
    })
  }

  // image generation
  const generateImage = true
  if (generateImage) {
    await generate([draftPosts, publicPosts].flat().map(remarkToPageInfo))
  }
}
