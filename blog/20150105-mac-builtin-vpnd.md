---
title: MacのVPNサーバー機能
slug: 20150105-mac-builtin-vpnd
date: 2015-01-05T00:00:00+0900
tags:
  - mac
  - terminal
  - launchctl
  - vpn
  - daemon

site: qiita
canonical: https://qiita.com/yu-ichiro/items/d20476ef7097961cf581
siteTags:
  - Mac
  - Terminal
  - launchctl
  - VPN
  - daemon
---
# MacでVirtualPrivateNetwork
仮想専用回線、と漢字に書くと難しく聞こえるこの機能、ビジネスで注目を浴びているそうですが、出先と自宅をつなぐっていうごく個人的な用途に使っても十分便利だったりします。

いろいろなVPNサーバーのプログラムがあると思いますが、macには標準でL2PT,PPTPを使ったvpndが搭載されています。Macのサーバーを購入するとGUIも標準でついてくるのですが、買わなくとも設定ファイルの場所と記述さえ把握していれば、TerminalからVPNサーバーが立てられるのです。

#サードパーティ製GUIアプリ
面倒くさいこと抜きにVPNやりたいって方は[VPN Activatar](http://www.netputing.com/applications/vpn-activator/
)がおすすめです。これから説明することを全部自動でやってくれます。

# 設定ファイル
`man vpnd`を読むとわかりますが、vpndの起動には専用のplistがいることが分かります。
`man vpnd -s 5`に詳しい説明と、**サンプルのplist**があるので、ここでは深い話を割愛させていただきます。

vpndの設定ファイルのパスは`/Library/Preferences/SystemConfiguration/com.apple.RemoteAccessServers.plist`です。
ファイルが存在しない場合、上記のmanページに書いてあるものを切り取って新しく作ることが出来ます。

サンプルとして載ってるサーバーは2種類あり、L2TP over IPSecのものとPPTPを使ったものです。ぱっとググってみたところ、L2TPは256bit暗号化、低速（といってもPPTPより2割ほどの速度減であるそうです）、PPTPは128bit暗号化、高速といった具合のようです。
お好きな方を選んでください。
サポート機器を増やすには両方起動することが望ましいと思いますが多分安全だったり楽なのは、一つだけ起動するものであると思います。

VPNDの説明にもありますがVPNDはVPNで受け取ったデータをPPPDに流しているので、ユーザー情報などはPPPDの設定に書く必要があります。
PPPDの設定は`/etc/ppp/`に置きます。
ここで必要なのはユーザーの情報だけです。
サンプルのVPND用plistにはMSCHAPv2認証を使うように書いてあったと思います。
他の認証方法だと設定の方法も変わってくるのかな。

`/etc/ppp/users.plist`に

```xml:users.plist
<?xml version="1.0" encoding="UTF-8"?>
 <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
 <plist version="1.0">
 <dict>
         <key>Password</key>
         <string><!-- パスワード --></string>
         <key>User</key>
         <string><!-- ユーザー名 --></string>
 </dict>
 </plist>
```

みたいに書けば大丈夫です。

# 起動
は驚くほど簡単。
`sudo vpnd`
これだけです。

# launchctlに登録
マシン起動時に毎回スタートして欲しいので、launchctlに書きます。
`/etc/hostconfig`に登録する方法もあって（てかそれがおすすめらしいけど）簡単ですが、VPNだけのために/etcにファイルを作ったりするのもあれだし、管理しやすくするためにlaunchctlを使おうと思います

root権限で起動して欲しいので、/Library/LaunchDaemonsに`com.apple.vpnd.plist`をパーミッション:644 root:wheel で作成します。

```xml:com.apple.vpnd.plist
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple Computer//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
        <key>Disabled</key>
        <false/>
        <key>Label</key>
        <string>com.apple.vpnd</string>
        <key>Program</key>
        <string>/usr/sbin/vpnd</string>
        <key>ProgramArguments</key>
        <array>
                <string>/usr/sbin/vpnd</string>
                <string>-x</string>
                <string>-i</string>
                <string>com.apple.ppp.l2tp</string>
        </array>
        <key>KeepAlive</key>
        <true/>
        <key>RunAtLoad</key>
        <true/>    
</dict>
</plist>
```
あとは
`sudo launchctl load /Library/LaunchDaemons/com.apple.vpnd.plist`
を実行すればOKです。

# なぜこれを書いたか
VPNActivatorを使ってたんだけど、なんか自前で同じことをしたくなって設定ファイルを探し始めたら思ったよりめんどくさかったから
