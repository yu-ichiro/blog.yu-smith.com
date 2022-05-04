---
title: さくらのVPS初期設定備忘録
slug: 20150106-sakura-vps-init
date: 2015-01-06T00:00:00+0900
tags:
  - centos
  - terminal
  - iptables
  - vps

site: qiita
canonical: https://qiita.com/yu-ichiro/items/4a82339a3c1a84469f8c
siteTags:
  - CentOS
  - Terminal
  - iptables
  - さくらVPS
---
次にまたサーバーを建てるときに忘れないように。こういうのを書く代わりにDockerとかVagrantとか使ったらいいのかな？
qiitaとドットインストール行ったり来たりしつつ、やりながら書いていきます。

# 1. rootパスワード変更
```bash
% passwd root
```

# 2. 作業用ユーザ作成
```bash
% useradd hoge
% passwd hoge
% usermod -G wheel hoge
```
# 3. wheelグループをsudoersに
```bash
% visudo
```
した後/wheelを検索し、コメントを外す。

# 4. 鍵認証設定
作業用ユーザでログインし

```bash
$ mkdir ~/.ssh
$ chmod 700 .ssh/
```

ローカルに戻り

```zsh:title=Terminal
$ cd ~/.ssh
$ ssh-keygen
$ chmod 600 id_rsa*
$ scp id_rsa.pub hoge@vps.com:~/.ssh/authorized_keys
```

終わったらローカルから

```zsh:title=Terminal
$ ssh -i ~/.ssh/id_rsa hoge@vps.com
```
でログインできれば完了。
次からはパスワードなしでログインできる。

# 5. sshd_config
sshdに関する設定を細かく書く。徐々にセキュリティを上げていくスタイル。
さくらのVPSは初期設定ですべてのポートがOPENなのでロックアウトを心配する必要なくポートの変更ができる。

```bash
$ sudo vim /etc/ssh/sshd_config
```

```bash:title=sshd_config
- #Port 22
+ Port 12345

- #PermitRootLogin yes
+ PermitRootLogin no

- PasswordAuthentication yes
+ PasswordAuthentication no
```

ローカルで`~/.ssh/configに以下を追記

```zsh:title=config
Host vps.com
Hostname vps.com
User hoge
Port 12345
Identityfile ~/.ssh/id_rsa
```

# 6. iptables
~~コピペ~~参考:[俺史上最強のiptablesをさらす](http://qiita.com/suin/items/5c4e21fa284497782f71)

`/etc/sysconfig/`以下にiptables-configがある。ここに直接`/etc/sysconfig/iptables`に書くべき内容を書いて苦労した。。

また、`/etc/sysconfig/iptables`は、文の途中のコマンドは許してくれず、長い文を`\[改行]`で読みやすくするのもだめだった。もちろん変数も使えない。

スクリプトで動的に管理するのが良さそうだけど、まあ最初は決め打ちで。

```bash:title=/etc/sysconfig/iptables
#### MAIN SETTINGS START ####
*filter
:INPUT    DROP    [0:0]
:FORWARD  DROP    [0:0]
:OUTPUT   ACCEPT  [0:0]
:SERVICES -       [0:0]

###########################################################
## 信頼可能なホストは許可
############################################################

## ローカルホスト
## lo はローカルループバックのことで自分自身のホストを指す
-A INPUT -i lo -j ACCEPT

###########################################################
# セッション確立後のパケット疎通は許可
###########################################################
-A INPUT  -m state --state ESTABLISHED,RELATED -j ACCEPT

###########################################################
# 攻撃対策: Stealth Scan
###########################################################
-N STEALTH_SCAN
-A STEALTH_SCAN -j LOG --log-prefix "stealth_scan_attack: "
-A STEALTH_SCAN -j DROP

# ステルススキャンらしきパケットは "STEALTH_SCAN" チェーンへジャンプする
-A INPUT -p tcp --tcp-flags SYN,ACK SYN,ACK -m state --state NEW -j STEALTH_SCAN
-A INPUT -p tcp --tcp-flags ALL NONE -j STEALTH_SCAN

-A INPUT -p tcp --tcp-flags SYN,FIN SYN,FIN         -j STEALTH_SCAN
-A INPUT -p tcp --tcp-flags SYN,RST SYN,RST         -j STEALTH_SCAN
-A INPUT -p tcp --tcp-flags ALL SYN,RST,ACK,FIN,URG -j STEALTH_SCAN

-A INPUT -p tcp --tcp-flags FIN,RST FIN,RST -j STEALTH_SCAN
-A INPUT -p tcp --tcp-flags ACK,FIN FIN     -j STEALTH_SCAN
-A INPUT -p tcp --tcp-flags ACK,PSH PSH     -j STEALTH_SCAN
-A INPUT -p tcp --tcp-flags ACK,URG URG     -j STEALTH_SCAN

###########################################################
# 攻撃対策: フラグメントパケットによるポートスキャン,DOS攻撃
# namap -v -sF などの対策
###########################################################
-A INPUT -f -j LOG --log-prefix 'fragment_packet:'
-A INPUT -f -j DROP

###########################################################
# 攻撃対策: Ping of Death
###########################################################
# 毎秒1回を超えるpingが10回続いたら破棄
-N PING_OF_DEATH
-A PING_OF_DEATH -p icmp --icmp-type echo-request -m hashlimit --hashlimit 1/s --hashlimit-burst 10 --hashlimit-htable-expire 300000 --hashlimit-mode srcip --hashlimit-name t_PING_OF_DEATH -j RETURN

# 制限を超えたICMPを破棄
-A PING_OF_DEATH -j LOG --log-prefix "ping_of_death_attack: "
-A PING_OF_DEATH -j DROP

# ICMP は "PING_OF_DEATH" チェーンへジャンプ
-A INPUT -p icmp --icmp-type echo-request -j PING_OF_DEATH

###########################################################
# 攻撃対策: SYN Flood Attack
# この対策に加えて Syn Cookie を有効にすべし。
###########################################################
-N SYN_FLOOD 
-A SYN_FLOOD -p tcp --syn -m hashlimit --hashlimit 200/s --hashlimit-burst 3 --hashlimit-htable-expire 300000 --hashlimit-mode srcip --hashlimit-name t_SYN_FLOOD -j RETURN

# 解説
# -m hashlimit                       ホストごとに制限するため limit ではなく hashlimit を利用する
# --hashlimit 200/s                  秒間に200接続を上限にする
# --hashlimit-burst 3                上記の上限を超えた接続が3回連続であれば制限がかかる
# --hashlimit-htable-expire 300000   管理テーブル中のレコードの有効期間（単位：ms
# --hashlimit-mode srcip             送信元アドレスでリクエスト数を管理する
# --hashlimit-name t_SYN_FLOOD       /proc/net/ipt_hashlimit に保存されるハッシュテーブル名
# -j RETURN                          制限以内であれば、親チェーンに戻る

# 制限を超えたSYNパケットを破棄
-A SYN_FLOOD -j LOG --log-prefix "syn_flood_attack: "
-A SYN_FLOOD -j DROP

# SYNパケットは "SYN_FLOOD" チェーンへジャンプ
-A INPUT -p tcp --syn -j SYN_FLOOD

###########################################################
# 攻撃対策: HTTP DoS/DDoS Attack
###########################################################
-N HTTP_DOS
-A HTTP_DOS -p tcp -m multiport --dports 80 -m hashlimit --hashlimit 120/ms --hashlimit-burst 120 --hashlimit-htable-expire 300000 --hashlimit-mode srcip --hashlimit-name t_HTTP_DOS -j RETURN

# 解説
# -m hashlimit                       ホストごとに制限するため limit ではなく hashlimit を利用する
# --hashlimit 120/ms                 1/100秒間120接続を上限とする
# --hashlimit-burst 120              上記の上限を120回連続で超えると制限がかかる
# --hashlimit-htable-expire 300000   管理テーブル中のレコードの有効期間（単位：ms
# --hashlimit-mode srcip             送信元アドレスでリクエスト数を管理する
# --hashlimit-name t_HTTP_DOS        /proc/net/ipt_hashlimit に保存されるハッシュテーブル名
# -j RETURN                          制限以内であれば、親チェーンに戻る

# 制限を超えた接続を破棄
-A HTTP_DOS -j LOG --log-prefix "http_dos_attack: "
-A HTTP_DOS -j DROP

# HTTPへのパケットは "HTTP_DOS" チェーンへジャンプ
-A INPUT -p tcp -m multiport --dports 80 -j HTTP_DOS

###########################################################
# 攻撃対策: IDENT port probe
# identを利用し攻撃者が将来の攻撃に備えるため、あるいはユーザーの
# システムが攻撃しやすいかどうかを確認するために、ポート調査を実行
# する可能性があります。
# DROP ではメールサーバ等のレスポンス低下になるため REJECTする
###########################################################
-A INPUT -p tcp -m multiport --dports 113 -j REJECT --reject-with tcp-reset

###########################################################
# 攻撃対策: SSH Brute Force
# SSHはパスワード認証を利用しているサーバの場合、パスワード総当り攻撃に備える。
# 1分間に5回しか接続トライをできないようにする。
# SSHクライアント側が再接続を繰り返すのを防ぐためDROPではなくREJECTにする。
# SSHサーバがパスワード認証ONの場合、以下をアンコメントアウトする
###########################################################
# -A INPUT -p tcp --syn -m multiport --dports $SSH -m recent --name ssh_attack --set
# -A INPUT -p tcp --syn -m multiport --dports $SSH -m recent --name ssh_attack --rcheck --seconds 60 --hitcount 5 -j LOG --log-prefix "ssh_brute_force: "
# -A INPUT -p tcp --syn -m multiport --dports $SSH -m recent --name ssh_attack --rcheck --seconds 60 --hitcount 5 -j REJECT --reject-with tcp-reset

###########################################################
# 攻撃対策: FTP Brute Force
# FTPはパスワード認証のため、パスワード総当り攻撃に備える。
# 1分間に5回しか接続トライをできないようにする。
# FTPクライアント側が再接続を繰り返すのを防ぐためDROPではなくREJECTにする。
# FTPサーバを立ち上げている場合、以下をアンコメントアウトする
###########################################################
# -A INPUT -p tcp --syn -m multiport --dports $FTP -m recent --name ftp_attack --set
# -A INPUT -p tcp --syn -m multiport --dports $FTP -m recent --name ftp_attack --rcheck --seconds 60 --hitcount 5 -j LOG --log-prefix "ftp_brute_force: "
# -A INPUT -p tcp --syn -m multiport --dports $FTP -m recent --name ftp_attack --rcheck --seconds 60 --hitcount 5 -j REJECT --reject-with tcp-reset

###########################################################
# 全ホスト(ブロードキャストアドレス、マルチキャストアドレス)宛パケットは破棄
###########################################################
-A INPUT -d 192.168.1.255   -j LOG --log-prefix "drop_broadcast: "
-A INPUT -d 192.168.1.255   -j DROP
-A INPUT -d 255.255.255.255 -j LOG --log-prefix "drop_broadcast: "
-A INPUT -d 255.255.255.255 -j DROP
-A INPUT -d 224.0.0.1       -j LOG --log-prefix "drop_broadcast: "
-A INPUT -d 224.0.0.1       -j DROP

###########################################################
# 全ホスト(ANY)からの入力許可
###########################################################

# ICMP: ping に応答する設定
-A INPUT -p icmp -j ACCEPT

# HTTP, HTTPS
-A INPUT -p tcp -m multiport --dports 80 -j ACCEPT

# SSH: ホストを制限する場合は TRUST_HOSTS に信頼ホストを書き下記をコメントアウトする
-A INPUT -p tcp -m multiport --dports 12345 -j ACCEPT

# FTP
# -A INPUT -p tcp -m multiport --dports $FTP -j ACCEPT # ANY -> SELF

# DNS
# -A INPUT -p tcp -m multiport --sports $DNS -j ACCEPT # ANY -> SELF
# -A INPUT -p udp -m multiport --sports $DNS -j ACCEPT # ANY -> SELF

# SMTP
# -A INPUT -p tcp -m multiport --sports $SMTP -j ACCEPT # ANY -> SELF

# POP3
# -A INPUT -p tcp -m multiport --sports $POP3 -j ACCEPT # ANY -> SELF

# IMAP
# -A INPUT -p tcp -m multiport --sports $IMAP -j ACCEPT # ANY -> SELF
COMMIT
#### MAIN SETTINGS END ####
```

書き込んだら
```bash
service iptables restart
```

通ったら確認するために**別タブで**ローカルからsshしてみる（戒め）

---

次にログの設定
old: /etc/syslog.conf
hayari: /etc/rsyslog.conf


```bash:title=rsyslog.conf

+ *kern.debug                                           /var/log/iptables

- *.info;mail.none;authpriv.none;cron.none              /var/log/messages
+ *.info;mail.none;authpriv.none;cron.none;kern.none    /var/log/messages
```


疲れた。。また明日。。
TODO:明日はzshをいれてデフォルトにして、git入れて自分の設定を持ってきてーとかやる。
