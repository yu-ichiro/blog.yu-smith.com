---
title: Gatsbyで静的なブログ投稿環境を構築してアウトプットを一箇所にまとめる
slug: gatsby-github-blog-system
tags:
- gatsby
- javascript
- typescript
- github
- netlify

draft: true

---

アウトプットの量を増やしていきたい所存です。yu-ichiroです。

今回はGatsbyでブログシステムを構築し、ブログ・Qiita記事・Zenn記事・etcのマスタ管理をGitHub上で一括管理できるようにします。
JavaScriptで書いてしまうことも多そうですが、ほとんどの部分をTypeScriptに置き換えられ、Gatsbyが内部で使うGraphQLのスキーマなども自動補完できたので安全な型環境の構築も同時に解説します。

# 作るもの

* Gatsby.js で作るブログシステム
* Netlify を使って GitHub から自動デプロイ
* 記事のマスタはソースコードとして一元管理
* どこに投稿したものなのかなどのメタデータはfrontmatter（後述）に記載
* 画像などは一旦考えない。GitHubのエディタにアップロードしてそれをマスタにしちゃうとか？
* OGPの自動生成にはライブラリを使う。ただ、中身の処理を理解できたら自分で書いちゃった方がいいかも

# 今回無視してしまったもの

Gatsby Starter Blog というほぼほぼ今回作るもの全部入りのボイラープレートが公式から提供されていました。
若干フォルダ構成などは違いますが、やりたいことなどは大体一緒でRSSフィードなどこのサンプルには含まれないものも入っています。（後で入れよ）
今回はどう言う組み合わせで中身が動いているかにフォーカスする記事として位置付けてもらえればと思います

# 目次

1. gatsby-cli を導入する
   1. package manager の設定
2. プロジェクトを始める
   1. Gatsbyのざっとした概要
3. TypeScript化できる部分を置き換える
4. GraphQLのスキーマ定義の吐き出し
   1. WebStormなどでGraphQLの補完を効かせる方法
   2. `graphql`をインポートできない場合の対処
5. ページをプログラマチックに生成する方法
6. graphql で markdown ファイルを取得してページ生成
   1. draftページの作成
   2. 関連するページの算出
7. テンプレートページの修正
   1. canonical設定
   2. frontmatterの内容に応じたページ内容の変化
8. OGP画像の生成
   1. ライブラリの利用
   2. ctxに対して自分で処理を書けるような拡張を可能にする patch-package
9. Netlifyとの連携
   1. 独自ドメインの振り分け


