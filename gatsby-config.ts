import type { GatsbyConfig } from "gatsby"
import path from "path"

const config: GatsbyConfig = {
  siteMetadata: {
    title: `yuichiro.__blog__`,
    description: `@yu-ichiroの書き物`,
    author: `@yu-ichiro`,
    siteUrl: `https://blog.yu-smith.com/`,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: [`G-F7J5YWDFC6`],
      },
    },
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: path.resolve(`src/assets/images`),
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `yuichiro.__blog__`,
        short_name: `__blog__`,
        start_url: `/`,
        background_color: `#574cf1`,
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        theme_color: `#574cf1`,
        display: `minimal-ui`,
        icon: `src/assets/images/blog_logo.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `markdown`,
        path: path.resolve(`blog`),
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          `gatsby-remark-hard-breaks`,
          `gatsby-remark-prismjs-title`,
          // `gatsby-remark-prismjs-copy-button`,  // wait until fix
          {
            resolve: "gatsby-remark-prismjs",
            options: {
              classPrefix: `language-`,
              inlineCodeMarker: null,
              aliases: {
                python3: "python",
                zsh: "bash",
              },
              showLineNumbers: true,
              noInlineHighlight: true,
            }
          }
        ],
      }
    },
    {
      resolve: `gatsby-plugin-graphql-codegen`,
      options: {
        fileName: `gql.ts`,
        documentPaths: [
          "./src/**/*.{ts,tsx}",
          "./gatsby-node.ts",
          "./node_modules/gatsby-*/**/*.js",
        ],
      },
    },
  ],
}

export default config
