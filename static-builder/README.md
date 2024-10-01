# web

## セットアップ
下のコマンドを実行したのち、 http://localhost:5173 でアクセス可能
```sh
docker compose up
```

## よく使いそうなコマンド
```sh
pnpm dev # 開発サーバーを起動

pnpm build # ビルド

pnpm lint # Biome でコードをチェック

pnpm format # Biome でコードをフォーマット

pnpm fix # Biome でlintエラーを修正し、コードをフォーマット
```

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
│   ├── index.html
│   ├── js # スクリプト
│   │   ├── main.js
│   │   ├── components # コンポーネント
│   │   ├── features # 機能ごとのcomponents, hooks, etc.
│   │   ├── infrastructures
│   │   │   └── api
│   │   ├── pages # ページ
│   │   └── libs # ライブラリ
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
      { onClick: () => setCount((c) => c + 1) },
      "Increment",
    ),
  );
}
```

### useCallbackフック

```js
function ParentComponent() {
  const [count, setCount] = Teact.useState(0)
  const incrementCount = Teact.useCallback(() => {
    setCount(prevCount => prevCount + 1)
  }, []) // 空の依存配列は、このコールバックが再作成されないことを意味します
  return Teact.createElement(
    'div',
    null,
    Teact.createElement('p', null, `Count: ${count}`),
    Teact.createElement(ChildComponent, { onClick: incrementCount }),
  )
}

function ChildComponent({ onClick }) {
  return Teact.createElement('button', { onClick: onClick }, 'Increment')
}
```

### useEffectフック

第二引数で指定した依存関係が変化すると第一引数で渡したコールバックが実行される

```js
function Counter() {
  const [count, setCount] = Teact.useState(0)

  Teact.useEffect(() => {
    console.log('count', count)
  }, [count])

  return Teact.createElement(
    'div',
    {},
    Teact.createElement(
      'h1',
      {},
      count
    ),
    Teact.createElement(
      'button',
      { onClick: () => setCount((c) => c + 1) },
      'Count'
    ),
  )
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
