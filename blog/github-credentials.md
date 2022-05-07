---
title: ローカルのgithubクレデンシャル管理のおさらいと複数アカウント管理の方法
slug: github-credentials
tags:
- github
- git
- diy
- ssh

draft: true
canonical: https://qiita.com/drafts/fe82a841b5951fc5c474/edit
---
複数のgithubアカウントを使おうとした時にエラーが出て詰まったのでその解決法とGitHub推奨の方法の備忘録です。

# httpsとgit-ssh

プライベートなgithubリポジトリをローカルにクローンする場合や、ローカルからgithubリポジトリにプッシュするためにはなんらかの認証方法でgithubに対して自分にアクセス権があることを証明しなければなりません。

```
$ git clone https://github.com/example/some-secret.git
Username for 'https://github.com/example/some-secret.git': example
Password for 'https://example@github.com/example/some-secret.git': ****
.
.
.
```

そのための方法として
1. https
2. ssh

があり、権限が必要な場合に`.ssh/config`にgithubの項目を追加するのはもはや当たり前にすらなっていると思います。
しかし今回は単純なsshでは問題が解決できなかった上、httpsでもセキュアにプッシュ/プルができる方法を勉強したのでそちらを紹介したいと思います。

# ケース: メインのアカウントAではなくアカウントBでプッシュを行いたい

普段使用しているアカウントAではなくアカウントBでプッシュを行おうとした時に問題が発生しました。

```bash

$ git clone https://github.com/account-b/example.git
.
.
.
$ git commit
$ git push
ERROR: Permission to account-b/example.git denied to account-a.
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

上のエラーが何をやっても消えませんでした。`git config -l`と睨めっこして正しくコミットの情報は書き変わっているのを確認しましたし、リモートのURLをsshにしてもだめでした（後述する解決策がありますが、今回はスルーしました）

## credential.helper

この項は環境依存になってしまうので全ての解決にはならないのですが、gitにはhttpsから始まるURLにアクセスする時に認証情報を保存する機構が備わっています。(→[https://git-scm.com/book/ja/v2/Git-のさまざまなツール-認証情報の保存](https://git-scm.com/book/ja/v2/Git-%E3%81%AE%E3%81%95%E3%81%BE%E3%81%96%E3%81%BE%E3%81%AA%E3%83%84%E3%83%BC%E3%83%AB-%E8%AA%8D%E8%A8%BC%E6%83%85%E5%A0%B1%E3%81%AE%E4%BF%9D%E5%AD%98))

この`git credential`が内部で働いているために、remote-urlがhttpsのレポジトリでプッシュする時にも最初の一回ユーザー名とパスワードを聞かれたあとはしばらく（or二度と）認証情報を入力しなくてすむのです。

そしてこの設定はインストール方法にもよりますが、**デフォルトでオンになっている場合が多いです**。

確認するためには`git config -l | grep credential`をコンソールで打ちます。

```
$ git config -l | grep credential
credential.helper=osxkeychain
```

自分は環境がMacだったのでこのように表示されました。
実際にKeychainAccessでgithubと検索するとそれらしき項目が存在しています。

## credential.useHttpPath
問題はこれがデフォルトでプロトコル・ドメインごとに保存されているということです。なのでaccount-aのレポジトリだろうがaccount-bのレポジトリだろうが構わずgithub.comに登録されているaccount-aのクレデンシャルを使ってしまっていたのでした。
これを回避するためのオプションが`credential.useHttpPath`です。


