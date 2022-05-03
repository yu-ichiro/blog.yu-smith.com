---
title: Pythonでは何も指定されなかったのか明示的にNoneが指定されたのか区別できない問題
slug: 20191001-python-empty-or-none
date: 2019-10-01T00:00:00+0900
tags:
  - python
  - iterator
  - option

site: qiita
canonical: https://qiita.com/yu-ichiro/items/dfd44bea75f23eb4b8e3
siteTags:
  - Python
  - Iterator
  - Python3
  - Iterable
---
表題の通りです

Pythonでは関数にデフォルト引数を定義することができます。

```python3
def add(a, b=1):
    return a + b

add(1, 2)  # 3
add(1)  # 2
```

便利なんですが落とし穴が多いことでも有名です。
[Pythonのデフォルト引数の挙動](https://qiita.com/ciloholic/items/751fc853a1ebd4632937)

だいたいの問題はデフォルト引数の値は**定義時**に評価されることから来るのですが、今回またちょっと違う問題に当たってしまったのでご紹介します。

# next(filter(...))

Pythonにはfilterもmapもありますが、findがないのは比較的有名だと思います。
多分製作者のこだわりだと思うんですが、itertoolsにもないのはちょっと理由がよくわからないです。

割と必要とする場面が多いので、itertoolsの[レシピ集](https://docs.python.org/ja/3/library/itertools.html#itertools-recipes)にあるものをちょっといじって使っています。<strike>（レシピ集に入れるのに実装はしないのはなぜ。。。？）</strike>

```python3
def find(filter_f, iter_, default=None):
    return next(filter(filter_f, iter_), default)
```

ようするにfilterの先頭から一つ取ろうという話なんですが、ここに罠がありました。

# find(f, iterable) と next(filter(f, iterable))の結果が違う
簡単なサンプルをご紹介しますと、

```python3
find(lambda a: a > 10, range(10))
# None
next(filter(lambda a: a > 10, range(10))
# Traceback (most recent call last):
#  File "<input>", line 1, in <module>
# StopIteration
```
はい、検索した項目が見つからなかった時の挙動が微妙に違いました。

# next(iterable) と next(iterable, default)の違い
簡単にいうとnextは第二引数が指定されていない時はStopIterationをそのままraiseし、第二引数が指定されている時は、raiseする代わりにキャッチしてdefaultを返します。

しかし、今回の処理ではdefaultが指定されていればそれを、指定されていなければNoneを第二引数に指定する、という処理になってしまっているため、上のコードは１対１で対応せず、実際には以下のようになっていたのです。

```python3
find(lambda a: a > 10, range(10))
# None
next(filter(lambda a: a > 10, range(10), None)
# None
```

だいたいの場面でこれが期待される動作として正しい気もするんですが、実際にはデフォルト値が定義されていないのに勝手にNoneを返すのはある意味`try: ... except Exception: pass`と同義であまり気持ちがいいものではありません。

# デフォルトのNoneと明示的なNoneをどう区別するか

上を踏まえると目指すべきコードとしては、

```python3
def find(filter_f, iter_, default=None):
    if ("""デフォルト値が設定されていないという条件"""):
        return next(filter(filter_f, iter_))
    else:
        return next(filter(filter_f, iter_), default)
```

のようになります。しかし、このままだとdefaultに明示的にNoneが指定されたか否かを判断する方法はありません。直感的にはdefaultには最初からNoneが代入されていて、指定された場合に上書きされる、というような挙動になっているからです。

これは-1や()でも同じような問題にぶち当たります。

# 解決法

https://stackoverflow.com/q/14749328/10299102

ここに来て伏線回収です。以下のコードをご覧ください

```python3
# https://stackoverflow.com/a/57628817/10299102
def f(value={}):
    if value is f.__defaults__[0]:
        print('default')
    else:
        print('passed in the call')
```

パッと見てあぶない！と思った方、ここ進研ゼミでやったところだ！状態ですね。バッチリ予習されています。
なんのことかと言いますと、`value={}`の部分です。基本的には関数のデフォルト引数にmutableなオブジェクトを設定してはいけません。**定義時**にデフォルト引数の値が評価されるため、関数に引数を与えずに呼び出すたびに、同じオブジェクトが使われ、予期しない結果になるからです。

ただ、今回はあえてオブジェクトを指定しています。定義時と全く同じオブジェクトが使われることを逆手にとり、isでidを比較することで、明示的に指定されたデータなのか、そうでないのかを区別することができます。上のコードを試しに実行すると、

```python3
f()  # default
f({})  # passed in the call
```
となり、値が同じものかに関わらず、指定されたか否かを正しく判断できていることがわかります。

# 改良版find
上のサンプルを見たときなるほどー！と思ったんですが、正直見づらいです。
`f.__defaults__[0]`という黒魔術っぽいものもあってちょっと、、という感じだったのですが、他の回答に改良方法が書いてあったので自分なりのアレンジを加えてお届けします。

オブジェクトのid比較をしたいだけなので、デフォルトのオプションは`{}`じゃなくても大丈夫です。

```python3
DEFAULT=object()

def find(filter_f, iter_, default=DEFAULT):
    if default is DEFAULT:
        return next(filter(filter_f, iter_))
    else:
        return next(filter(filter_f, iter_), default)
```

ただこれだけだとDEFAULTがただのobjectとしてしか見えず、デバッグのこととかを考えると型がobjectとしての情報しか持っていないのはちょっと嫌なので、専用のクラスを定義してあげます。

```python3
class Default:
    def __repr__(self):
        return "DEFAULT"

DEFAULT=Default()

def find(filter_f, iter_, default=DEFAULT):
    if default is DEFAULT:
        return next(filter(filter_f, iter_))
    else:
        return next(filter(filter_f, iter_), default)
```

だいたいこれでいいんですが、グローバル変数DEFAULTがどうしても残ってしまいます。
ちょっと気持ち悪いので、シングルトン化をすることでどこでクラスをインスタンス化しても、idが一意に定まるようにしてあげましょう！

```python3
class Default:
    __singleton = None

    def __new__(cls, *args, **kwargs):
        if cls.__singleton is None:
            cls.__singleton = super(Default, cls).__new__(cls)
        return cls.__singleton

    def __repr__(self):
        return "DEFAULT"

def find(filter_f, iter_, default=Default()):
    if default is Default():
        return next(filter(filter_f, iter_))
    else:
        return next(filter(filter_f, iter_), default)
```

最後に、StopIterationを返すだけだと、検索をして見つからなかったという情報がないので、StopIterationのサブクラス、NotFoundを定義することで、その情報を明示します。

```python3
class Default:
    __singleton = None

    def __new__(cls, *args, **kwargs):
        if cls.__singleton is None:
            cls.__singleton = super(Default, cls).__new__(cls)
        return cls.__singleton

    def __repr__(self):
        return "DEFAULT"


class NotFound(StopIteration):
    """見つからなかったことを明示する"""
    pass


def find(filter_f, iter_, default=Default()):
    if default is Default():
        try:
            return next(filter(filter_f, iter_))
        except StopIteration:
            pass
        raise NotFound()
    else:
        return next(filter(filter_f, iter_), default)
```
---
ということでfind関数の改良版を作る記事でした(そうだっけ)
IteratorやGenerator周りは奥が深いのでこれからも色々と記事を書いていければなと思います。

※記事の内容はニュアンスで書いているところが多いので、不正確な部分があるかもしれません、、随時ご指摘、編集リクエストお待ちしております。

