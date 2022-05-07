---
title: CAを立ててlocalhostをSSL/TLS化してみよう！
slug: localhost-ca
tags:
- pki
- tls
- ca
- nginx
- openssl

draft: true
canonical: https://qiita.com/drafts/4ba229cc802eb7352971/edit
---
公開鍵暗号が発明され、現在の生活に欠かせないものになって久しいですが、具体的な技術面での話になるとかなりブラックボックス（のように扱われる）部分が多く、SSL/TLS化一つとってもいわゆる「おまじない」で済ませてしまうことも多いのではないでしょうか。

この記事では、もう一歩進んだ理解が得られることを目指して、

1. いわゆるオレオレCAを立て
2. オレオレlocalhost証明書を発行し
3. localhostでnginxを動かし
4. localhostをSSL/TLS化する

ところまでをハンズオン形式で解説していこうと思います。


# CAの作成

```
$ mkdir /etc/ca
$ cd /etc/ca
```

```
$ openssl genrsa 4096 > ca.key
Generating RSA private key, 4096 bit long modulus
..........................................++
......................................................................................................................................................................++
e is 65537 (0x10001)
```

```
$ openssl req -new -key ca.key > ca.csr
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) []:JP
State or Province Name (full name) []:Tokyo
Locality Name (eg, city) []:Shinjuku
Organization Name (eg, company) []:Example, co.
Organizational Unit Name (eg, section) []:.
Common Name (eg, fully qualified host name) []:Example Root CA
Email Address []:admin@example.com

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:↩︎
```

```
$ cat << EOF > v3.ext
subjectKeyIdentifier=hash↲
authorityKeyIdentifier=keyid:always,issuer:always↲
basicConstraints=critical,CA:TRUE↲
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment, keyCertSign↲
```

```
$ openssl x509 -req -in ca.csr -signkey ca.key -days 3650 -out ca.crt -extfile v3.ext -sha256
Signature ok
subject=/C=JP/ST=Tokyo/L=Shinjuku/O=Example, co./CN=Example Root CA/emailAddress=admin@example.com
Getting Private key
```

CAの完成！

`キーチェーンアクセス`>`ファイル`>`読み込む...`で、作ったばかりの`ca.crt`を選択してシステム(または)ログインキーチェーンに追加

バツマークがついている

信頼しないといけない
`信頼`>`この証明書を信頼する時`で`常に信頼`を選択

同じことを、

```
$ sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ca.crt
```
でもできる。

# localhost向けSSL/TLS証明書の作成

```
$ mkdir -p certs/localhost
$ cd certs/localhost
```

```
$ openssl genrsa 2048 > localhost.key  # 2048bitが最低限必要（デフォルトで2048）
Generating RSA private key, 2048 bit long modulus
...........................................................................................................................................+++
.............+++
e is 65537 (0x10001)
```

```
$ openssl req -new -key localhost.key > localhost.csr
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) []:JP
State or Province Name (full name) []:Tokyo
Locality Name (eg, city) []:Shinjuku
Organization Name (eg, company) []:Example, co.
Organizational Unit Name (eg, section) []:DEV Unit
Common Name (eg, fully qualified host name) []:localhost
Email Address []:admin@example.com

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
```
Common NameがいわゆるCN。一昔前まではここにSSL/TLS化したいサイトのFQDN(ドメイン)を入れていた

```
$ cat << EOF > v3.ext
authorityKeyIdentifier=keyid,issuer
subjectKeyIdentifier=hash
basicConstraints=critical,CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage=serverAuth,clientAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
```

```
$ openssl x509 -req -in localhost.csr -CA ../../ca.crt -CAkey ../../ca.key -CAcreateserial -days 730 -out localhost.crt -extfile v3.ext -sha256
Signature ok
subject=/C=JP/ST=Tokyo/L=Shinjuku/O=Example, co./OU=DEV Unit/CN=localhost/emailAddress=admin@example.com
Getting CA Private Key
```

# localhostでnginxを動かす

```
$ brew install nginx
```

```diff:/usr/local/etc/nginx/nginx.conf
   server {
-      listen       8080;
+      listen       80;
       server_name  localhost;
```

```
$ sudo service brew service start nginx
```

# localhostをSSL/TLS化する

```diff:/usr/local/etc/nginx/nginx.conf
+    server {
+        listen       443 ssl;
+        server_name  localhost;
+
+        ssl_certificate      /etc/ca/certs/localhost/localhost.crt;
+        ssl_certificate_key  /etc/ca/certs/localhost/localhost.key;
+
+        location / {
+            root   html;
+            index  index.html index.htm;
+        }
+    }
```


# 応用編

## dnsmasq
CA形式にしてnginxを噛ませた理由
任意のポートにローカルに立てたDNSで特殊なドメイン名を解決してHTTPSできる
