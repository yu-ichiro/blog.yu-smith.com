---
title: vimをアップデートすると同時にHomebrew管理に移行する
slug: 20141229-vim-upgrade-with-brew
date: 2014-12-29T00:00:00+0900
tags:
  - vim
  - shell
  - homebrew
  - mac

site: qiita
canonical: https://qiita.com/yu-ichiro/items/c9db44671701e7f485af
siteTags:
  - Vim
  - Mac
  - homebrew
---
# あらすじ
## viとvi-improved
Linuxに触りたての頃、cdでディレクトリ移動、lsでフォルダ内を表示、rmで削除、っていう流れで、ファイル編集はviコマンド！と間違えてるような間違えてないような、適当な感じで覚え、.bashrc一つ編集するのに四苦八苦しながら:wq、:q!を覚えたのは懐かしい思い出です。（カーソル移動は矢印キー）

さてようやく最近になってviは古く、実体はvimである、かなりヤバいテキストエディタである、崇拝者が何千人もいる、ということをだんだんと理解してきました。

## 7.3
OSにプリインストールされているだけでビルトインではないことを知った僕は、引数なしのvimコマンドを実行し、バージョンが現行より大分古い7.3であることを確認しました。

もっとvimを使いこなし一人前のスーパーハカーになるためにもこのままではいけない。。

# Homebrew
というわけで、Homebrewに上がっているバージョンのvimをインストールし、既存のものからそっちに移行します。

まずは厳かに、

```zsh:Terminal
% brew info vim
vim: stable 7.4.488, HEAD
http://www.vim.org/
Conflicts with: ex-vi
Not installed
From: https://github.com/Homebrew/homebrew/blob/master/Library/Formula/vim.rb
==> Dependencies ...
```

ふむ。バージョンは7.4.488。。最新版はもう少し上だがまあ許容範囲内でしょう。

えいや。

```zsh:Terminal
% brew install vim --with-lua
==> Installing vim dependency: lua
==> Downloading https://downloads.sf.net/project/machomebrew/Bottles/lua-5.2.3_1
######################################################################## 100.0%
==> Pouring lua-5.2.3_1.yosemite.bottle.tar.gz
?  /usr/local/Cellar/lua/5.2.3_1: 13 files, 308K
==> Installing vim
==> Downloading http://ftp.debian.org/debian/pool/main/v/vim/vim_7.4.488.orig.ta
######################################################################## 100.0%
==> Patching
==> ./configure --prefix=/usr/local --mandir=/usr/local/Cellar/vim/7.4.488/share
==> make
==> make install prefix=/usr/local/Cellar/vim/7.4.488 STRIP=true
?  /usr/local/Cellar/vim/7.4.488: 1600 files, 26M, built in 88 seconds
```

無事、インストール完了！

# 移行
と銘打ちましたがPATHの設定がちゃんとしていればちゃんと新しいvimが読み込まれ、設定とかhistoryとかも引き継いでくれるはずです。

`echo $PATH | tr ":" "\n"`を実行し

```zsh:Terminal
% echo $PATH | tr ":" "\n"
/usr/local/bin
/usr/bin
/bin
/usr/local/sbin
/usr/sbin
/sbin
/opt/X11/bin
/Users/***/bin
```

このように/usr/local/binが/usr/binよりも上に来ていれば自動的に新しい方のvimが読み込まれます。

もしそうでなかったら各種rcファイルに`export PATH=/usr/local/bin:$PATH`を記述するか、/etc/pathsを編集し並べ替えます。

一旦Terminalを閉じるか、別のウインドウを開いて、vimと入力し、バージョンが変わっていれば成功！

```zsh:Terminal
1 
~                                                                               
~                                                                               
~                                                                               
~                                                                               
~                                                                               
~                              VIM - Vi IMproved                                
~                                                                               
~                               version 7.4.488                                 
```

やったね！これで新しいvimが使い放題！アップデートも`brew update && brew upgrade`で簡単！
