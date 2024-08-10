# web

## ライブラリ

- Bootstrap

## ディレクトリ構成

基本的にいじっていくのは `src` ディレクトリ内のファイル。

```sh
.
├── README.md
├── dist # ビルド後のファイル
├── node_modules # パッケージ
├── package.json
├── pnpm-lock.yaml
├── public # 静的ファイル
│   └── vite.svg
├── src
│   ├── assets # 画像などのリソース
│   │   └── images
│   │       └── javascript.svg
│   ├── components
│   ├── index.html
│   ├── js # スクリプト
│   │   ├── main.js
│   │   └── teact.js
│   └── scss # スタイルシート
│       └── styles.scss
└── vite.config.js # Vite の設定ファイル
```

## teact

### createElement関数

```js
Teact.createElement(type, props, ...children);
```

type には要素名を指定し、props には要素の属性を指定する。
propsで`href`, `src`などHTMLの属性を指定することができる。
また、`className`を指定することでBootstrapのクラスを指定したり、カスタムクラスを指定することができる。
propsがない場合はnullを指定する。
children には任意の個数の子要素を指定する。

```js
const element = Teact.createElement(
  "div",
  { className: "container" },
  Teact.createElement("h1", null, "Hello, Teact!"),
  Teact.createElement("p", null, "This is a paragraph."),
);
```

### useStateフック

ReactのDocs見てみるのがいいかも。

```js
function Counter() {
  const [count, setCount] = Teact.useState(0);

  return Teact.createElement(
    "div",
    null,
    Teact.createElement("p", null, `Count: ${count}`),
    Teact.createElement(
      "button",
      { onClick: () => setCount(count + 1) },
      "Increment",
    ),
  );
}
```

### render関数

要素をDOMにレンダリングする。

```js
const container = document.getElementById("app");
Teact.render(Teact.createElement(Counter), container);
```

### 関数コンポーネントの作成

```js
function App() {
  return Teact.createElement(
    "div",
    null,
    Teact.createElement("h1", null, "Welcome to Teact!"),
    Teact.createElement(Counter),
  );
}

const container = document.getElementById("app");
Teact.render(Teact.createElement(App), container);
```

### イベントハンドラ

onClick や onChange などのイベントハンドラをプロパティとして渡すことができる。

```js
function Button() {
  const [clicked, setClicked] = Teact.useState(false);

  return Teact.createElement(
    "button",
    { onClick: () => setClicked(true) },
    clicked ? "Clicked!" : "Click me",
  );
}

const container = document.getElementById("app");
Teact.render(Teact.createElement(Button), container);
```
