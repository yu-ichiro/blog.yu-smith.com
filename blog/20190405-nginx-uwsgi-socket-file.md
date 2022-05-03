---
title: NGINX、uWSGI間をソケット通信する場合、/tmpに.sockを置いちゃダメ！(Centos 7)
slug: 20190405-nginx-uwsgi-socket-file
date: 2019-04-05T12:00:00+0900
tags:
  - nginx
  - uwsgi
  - python
  - centos

site: qiita
canonical: https://qiita.com/yu-ichiro/items/55bf9a4399524eb7f726
siteTags:
  - nginx
  - uwsgi
  - centos7
---
# 結論から
CentOS 7ではプログラムごとに`/tmp`が別に用意されるらしく、nginxから見える`/tmp`とuwsgiから見える`/tmp`が違うため、`/tmp/uwsgi.sock`がnginxから見つからない、という事態に陥っていた。
→ `/run`を使う
→ そのままだと再起動時に`/run/app`が削除されるため、永続化する

# それぞれの設定

```nginx:nginx.conf
server {
  ...
  location / {
    include uwsgi_params;
    uwsgi_ignore_client_abort on;
    uwsgi_pass unix:///tmp/uwsgi/app.sock -> unix:///run/app/app.sock;
  }
}
```

```ini:uwsgi.ini
[uwsgi]

# ...

#socket file's location
socket = /tmp/uwsgi/app.sock -> /run/app/app.sock

uid = app
gid = app
#pid
pidfile = /tmp/uwsgi/app.pid -> /tmp/app/app.pid

#permissions for the socket file
chmod-socket = 666

logto = /var/log/uwsgi/app.log

# ...

```

`/run/uwsgi`ではなく`/run/app`にしているのは`uwsgi`とは別のユーザーを使いたいから。

```bash
sudo mkdir -p /run/app
sudo chown app:app /run/app
```

```:/etc/tmpfiles.d/app.conf
#Type   Path                    Mode    UID     GID     Age     Argument
d       /var/run/app            0755    app     app     -
```


# 参考
[python - Got 'No such file or directory' error while configuring nginx and uwsgi - Stack Overflow](https://stackoverflow.com/questions/32974204/got-no-such-file-or-directory-error-while-configuring-nginx-and-uwsgi)
[nginx unix domain socket error - Server Fault](https://serverfault.com/questions/463993/nginx-unix-domain-socket-error/464025#464025)

[CentOS 7 : /var/run 直下に作ったディレクトリが消えないようにする - eTuts+ Server Tutorial](https://server.etutsplus.com/centos-7-tmpfiles-d-deleted-outdate-files/)

