---
title: ShellScriptでフラグ
slug: 20150106-shellscript-flag
date: 2015-01-21T00:00:00+0900
tags:
  - shell

site: qiita
canonical: https://qiita.com/yu-ichiro/items/90b974adcf44da1bd400
siteTags:
  - ShellScript
---
Shellでフラグを使いたい！という場合、今まではTest文のANDチェーンで動かしていましたが、`true`コマンドと`false`コマンドを見つけたのでメモります。

```zsh:Terminal
local powerline_enabled
powerline_enabled=true

[ $powerline_enabled = "true" ]&& printf "POWERLINE \ue0b0"  #Before
$powerline_enabled&& printf "POWERLINE \ue0b0" #After

```

スマートだけど危なそう。ちゃんとtrueかfalse代入しとけばいいと思うけど。
