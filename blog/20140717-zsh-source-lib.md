---
title: zshの設定ファイルを分割して整理しやすくする
slug: 20140717-zsh-source-lib
date: 2014-07-17T00:00:00+0900
tags:
  - shell
  - source
  - zsh

site: qiita
canonical: https://qiita.com/yu-ichiro/items/6441453321c06484bb22
siteTags:
  - ShellScript
  - Zsh
---
# .zshrc before...

初期の設定をし終わったあとでも、zshの設定には追加できるものが多いです。
新しい設定を付け足すたびにごちゃごちゃしがちな設定ファイル群ですがまとめればスマートに出来ると思います
# .(source)

.(source)コマンドを使って外部のスクリプトを実行することで変数や関数をそのまま引き継ぐことが出来ます。

```bash
$ cat hello.sh
#! /bin/bash

hello="world!"

function hi {
	echo "hi!${hello}"
}

hi
$ bash hello.sh
hi!world!
$ hi
zsh: command not found: hi
$ echo $hello

$ . ./hello.sh
hi!world!
$ hi
hi!world!
$ echo $hello
world!
```
このコマンドを使って外部にエイリアスなどを移動したいと思います

#関数の定義

```bash
function loadlib() {
        lib=${1:?"You have to specify a library file"}
        if [ -f "$lib" ];then #ファイルの存在を確認
                . "$lib"
        fi
}
```
この関数を.zshrcなどの頭に書いておけば `loadlib /path/to/lib` で外部に分けた設定ファイルを読み込むことが出来ます。

# .zshrc after!

```bash:.zshrc
function loadlib() {
        lib=${1:?"You have to specify a library file"}
        if [ -f "$lib" ];then #ファイルの存在を確認
                . "$lib"
        fi
}

loadlib $ZDOTDIR/zshfunc		#関数
loadlib $ZDOTDIR/zshautoload	#autoload
loadlib $ZDOTDIR/zshopts		#optset
loadlib $ZDOTDIR/zshalias		#alias
loadlib $ZDOTDIR/zshvars		#変数

```
スッキリしました
\#何をやっているのか分かりにくくなっただk(ry
