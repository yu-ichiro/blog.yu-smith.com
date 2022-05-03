---
title: 日本語版のmanページをMacで開く(groffアップデート)
slug: 20150101-japanese-man-page-groff
date: 2015-01-01T00:00:00+0900
tags:
  - shell
  - homebrew
  - mac
  - man
  - groff

site: qiita
canonical: https://qiita.com/yu-ichiro/items/ea9c672e2d7488416db9
siteTags:
  - ShellScript
  - Mac
  - homebrew
  - man
  - groff
---
# groff Fatal error
先日「[vimをアップデートすると同時にHomebrew管理に移行する](http://qiita.com/yu-ichiro/items/c9db44671701e7f485af)」という投稿をしたんですが、その後vimのmanページを開こうとすると、

```zsh:Terminal
$ man vim
/usr/bin/groff: can't find `DESC' file
/usr/bin/groff:fatal error: invalid device `nippon'
```

何やら出てきて怒られてしまいました。
突然manが見られなくなったと思ったらgroffとか言う謎のコマンドがエラーを吐く。

# 原因
参考： [jmanを使わずにMacのmanを日本語化する方法](http://tukaikta.blog135.fc2.com/blog-entry-224.html)

どうやらvimをインストールした時、ありがたいことに日本語版のmanをインストールしていただいたようで、賢いman君は$LANGから最適な言語を探し、`man vim`を実行すると自動的に日本語版を見つけてくれるようになりました。

ただし、ここで問題が。manが最適なページを探し、それを整形して表示するために、groffを使うのですが、標準にインストールされているものは日本語に対応していません。

その証拠に、`env LANG=C man vim`を実行すれば英語版が普通に表示されました。
なのでmanを実行するとき強制的に英語版を表示するようにすれば一応表示問題は解決です。

日本語版manとかダサい。英語の勉強も兼ねてるんで。翻訳は信用出来ない。っていう方々は、お使いのshellのrcファイルに
`alias man='env LANG=C man'`
の一行を足せば万事解決です。

# 日本語版manをMacで読めるようにする
でも、せっかく日本語manをインストールしていただけたのですし、ないことにするのは少しもったいない気がします。
そこで新しいgroffをインストールし、日本語版のmanを読めるようにします。

# brew install groff

~~Homebrewのdupesリポジトリには標準でインストールされているコマンドの"dupes"、同じもののHomebrew版が用意されています。
その中に目的のgroffも含まれているので、`brew tap homebrew/dupes`を実行し、リポジトリを追加します。~~
追記：いつしかのHomebrewメジャーアップデートでHomebrew公式が運営しているtapは基本的にhomebrew-coreに吸収されたらしいです。幸いgroffは吸収も生き残ってそのままインストールできました。

そして、`brew install groff`！
インストールが終わった後、`where groff`をして`/usr/local/bin/groff`が表示されていることを確認しましょう。

# man.conf

あとはmanに新しい方のgroffを使うように設定すればOKです！
manの設定は/etc/man.confにあるので、
`$ sudo vim /etc/man.conf`
で編集します。

95行目付近に`JNROFF`から始まる行があるので、

```diff:/etc/man.conf
- JNROFF /usr/bin/groff -Tnippon -mandocj -c
+ JNROFF /usr/local/bin/groff -Dutf8 -Tutf8 -mandoc -mja -E
```

上のものから下のものに置き換えましょう。

次に105~106行目付近の`PAGER`、`BROWSER`それぞれを

```diff:/etc/man.conf
- PAGER           /usr/bin/less -is
+ PAGER           /usr/bin/less -isr
- BROWSER         /usr/bin/less -is
+ BROWSER         /usr/bin/less -isr
```
このように末尾に`r`を付け足し完了です！

### 追記：
コメントでいただきましたが、
アップデートの度に/etc/man.confが上書きされるらしく？毎回これをすることになるらしいので簡単なpatchを、、

```zsh:patch.zsh
PROFILE=~/.zprofile  # 自分が使うシェルのprofileに変更

cp /etc/man.conf ~/.man.conf
sed -i -e 's/^JNROFF\(.*\)\/.*$/JNROFF\1\/usr\/local\/bin\/groff -Dutf8 -Tutf8 -mandoc -mja -E/' ~/.man.conf
sed -i -e 's/^\(PAGER.*\)/\1r/' ~/.man.conf
sed -i -e 's/^\(BROWSER.*\)/\1r/' ~/.man.conf
echo 'alias man="man -C ~/.man.conf"' >> $PROFILE
```

# 確認

さて用意が出来たので、`man vim`など、日本語版のmanが用意されているコマンドを見てみましょう。

```zsh:Terminal
VIM(1)               General Commands Manual                VIM(1)

名前
       vim - Vi IMproved, プログラマのテキストエディタ

書式
       vim [options] [file ..]
       vim [options] -
       vim [options] -t tag
       vim [options] -q [errorfile]

       ex
       view
       gvim gview evim eview
       rvim rview rgvim rgview

```

バッチリですね！


# あとがき

特定のmanファイルだけ見れないことが今までもあったのですが、深く考えてなかったです。。

# 追記(2020/02/02)

こんな古い記事でもいまだに需要があるようで、、ありがたいです。
古い情報になっている部分を変更しました。
いまだにmac標準インストールのman, groffではこの問題が解決されていないみたいですね、、
