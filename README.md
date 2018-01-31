# (ReactRedux.connect)でTypeScriptの型推論地獄に迷い込んだ #TypeScript
React+Reduxの組み合わせで開発を行っています。
そこで出くわすReactRedux.connect 。
こいつをComponentに食わせるとReduxのStateの情報をPropsにお渡し済みのコンポーネントを返してくれる。
とっても素敵なやつですが、型定義を見ると地獄でした。

# ActionDispacherについて

Reduxについて弄る時にミドルウエアを駆使して非同期処理をしていましたが以下の記事を見てからは
ActionDispacherを使う方針にしています。

ReduxでのMiddleware不要論
https://qiita.com/uryyyyyyy/items/d8bae6a7fca1c4732696

ちょっと改変してActionDispacherにReduxのステートをまるごと渡してなんでもできるクラスにしてしまってます。

```js
export class ActionDispatcherBase {
  dispatch: Dispatch<{}>;
  state: reducers.State;
  constructor(dispatch: Dispatch<{}>, state: reducers.State /*ここがMy改変 改悪？*/) {
    this.dispatch = dispatch;
    this.state = state;
  }
}
```

すると、connectの書き方はこんなふうになってしまいました。

```js
// Editorは propsにsearchKeyとactionsをもつComponentです。

export default connect(
  (state: reducers.State) => ({ state }),
  dispatch => ({ dispatch }),
  ({ state }, { dispatch }) => (
    {
      searchKey: state.editor.searchKey,
      actions: new ActionDispatcher(dispatch, state)
    }
  )
)(Editor);
```

なんでこうなっているかというと
connectのこんな書き方に従っています。

```js
    connect(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    )
```

更に纏めると

```
mapStateToProps:   (state: reducers.State) => ({ state }),
mapDispatchToProps:  dispatch => ({ dispatch }),
mergeProps: ({ state }, { dispatch }, onwProps) => {
      searchKey: state.editor.searchKey,
      actions: new ActionDispatcher(dispatch, state)
}
```

つまり``mapStateToProps``で``state全体``を取得、``mapDispatchToProps``で``dispatch``を取得
そして``mergeProps``で全部がっちゃんこするという書き方になっています。
これはActionDispatcher にdispatchとrootStateを渡すためにこういう書き方をしました。
もっと簡単な方法があれば教えてください。

これでActionDispatcherが全能なやつになります。
ところでconnectの書き方がこのままだと凄く冗長なのでラップしたmyConnect関数を作りたくなってきました。
ところがそうは問屋が卸さない。エラーが出まくります。自作関数でラップすると上手く型推論できなくなってしまうようです。

じゃあ上記connectはどういう推論を行っているのか

# ReactRedux.connectの型定義を見に行く

見てみるとトンデモなかったです。

```ts:型定義抜粋
export interface Connect {
    (): InferableComponentEnhancer<DispatchProp<any>>;

    <TStateProps = {}, no_dispatch = {}, TOwnProps = {}>(
        mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps>
    ): InferableComponentEnhancerWithProps<TStateProps & DispatchProp<any>, TOwnProps>;

    <no_state = {}, TDispatchProps = {}, TOwnProps = {}>(
        mapStateToProps: null | undefined,
        mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>
    ): InferableComponentEnhancerWithProps<TDispatchProps, TOwnProps>;

    <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}>(
        mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps>,
        mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>
    ): InferableComponentEnhancerWithProps<TStateProps & TDispatchProps, TOwnProps>;

    <TStateProps = {}, no_dispatch = {}, TOwnProps = {}, TMergedProps = {}>(
        mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps>,
        mapDispatchToProps: null | undefined,
        mergeProps: MergeProps<TStateProps, undefined, TOwnProps, TMergedProps>,
    ): InferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;

    <no_state = {}, TDispatchProps = {}, TOwnProps = {}, TMergedProps = {}>(
        mapStateToProps: null | undefined,
        mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
        mergeProps: MergeProps<undefined, TDispatchProps, TOwnProps, TMergedProps>,
    ): InferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;

    <no_state = {}, no_dispatch = {}, TOwnProps = {}, TMergedProps = {}>(
        mapStateToProps: null | undefined,
        mapDispatchToProps: null | undefined,
        mergeProps: MergeProps<undefined, undefined, TOwnProps, TMergedProps>,
    ): InferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;

    <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, TMergedProps = {}>(
        mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps>,
        mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
        mergeProps: MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps>,
    ): InferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;

    <TStateProps = {}, no_dispatch = {}, TOwnProps = {}>(
        mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps>,
        mapDispatchToProps: null | undefined,
        mergeProps: null | undefined,
        options: Options<TStateProps, TOwnProps>
    ): InferableComponentEnhancerWithProps<DispatchProp<any> & TStateProps, TOwnProps>;

    <no_state = {}, TDispatchProps = {}, TOwnProps = {}>(
        mapStateToProps: null | undefined,
        mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
        mergeProps: null | undefined,
        options: Options<no_state, TOwnProps>
    ): InferableComponentEnhancerWithProps<TDispatchProps, TOwnProps>;

    <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}>(
        mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps>,
        mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
        mergeProps: null | undefined,
        options: Options<TStateProps, TOwnProps>
    ): InferableComponentEnhancerWithProps<TStateProps & TDispatchProps, TOwnProps>;

    <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, TMergedProps = {}>(
        mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps>,
        mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
        mergeProps: MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps>,
        options: Options<TStateProps, TOwnProps, TMergedProps>
    ): InferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;
}

```
これ人間が書いたの？ 正直全部を確認するのは無理です。

# 推論内容

ちょっと心が折れましたけど、全部を見る必要はないはずです。推論から該当箇所を見つけるほうが簡単でした。

vscodeのポップアップから頑張ってコピペします。カーソルを上手く合わせないと出ないのでコピペが難しいです
もっとコマンド一発で推論状況がわかるやつがほしいです。


```typescript
// Editorは propsにsearchKeyとactionsをもつComponentです。
export default connect(
  (state: reducers.State) => ({ state }),
  dispatch => ({ dispatch }),
  ({ state }, { dispatch }) => (
    {
      searchKey: state.editor.searchKey,
      actions: new ActionDispatcher(dispatch, state)
    }
  )
)(Editor);

```

の推論結果はこうなります。

```typescript

(alias) connect<{
    state: reducers.State;
}, {
    dispatch: Dispatch<any>;
}, {}, {
    searchKey: string | undefined;
    actions: ActionDispatcher;
}>(mapStateToProps: MapStateToPropsParam<{
    state: reducers.State;
}, {}>, mapDispatchToProps: MapDispatchToPropsParam<{
    dispatch: Dispatch<any>;
}, {}>, mergeProps: MergeProps<{
    state: reducers.State;
}, {
    dispatch: Dispatch<any>;
}, {}, {
    searchKey: string | undefined;
    actions: ActionDispatcher;
}>): InferableComponentEnhancerWithProps<{
    searchKey: string | undefined;
    actions: ActionDispatcher;
}, {}> (+11 overloads)
import connect

```
あー。わかんない。
生成すると EditorPropsの箇所はわかっているので纏めます。

```
export interface EditorProps {
  searchKey: string | undefined;
  actions: ActionDispatcher;
}

```
上記を当てはめると以下のようになります。

```typescript
(alias) connect<{state: reducers.State;}, {dispatch: Dispatch<any>;}, {}, EditorProps>
(
mapStateToProps: MapStateToPropsParam<{ state: reducers.State;}, {}>, 
mapDispatchToProps: MapDispatchToPropsParam<{ dispatch: Dispatch<any>;}, {}>, 
mergeProps: MergeProps<{ state: reducers.State;}, { dispatch: Dispatch<any>;}, {}, EditorProps>
): 
InferableComponentEnhancerWithProps<EditorProps, {}>

```

うむうむ。なんとなくわかってきました。とにかく上記は上手く動いている例です。
最終的な返り値に注目します。


```typescript
InferableComponentEnhancerWithProps<EditorProps, {}>
```

何はともあれ最終的に上記形になれば上手く動くようになるんです。
上の意味を調べていきます。

型定義ファイルに飛びます。


```typeScript
/*
Propsを注入し、Propsの必要条件から取り除きます。 
レンダリング中に渡された場合、注入されたPropsを通過しません。 
また、TNeedsPropsからの新しいProps要件を追加します。
*/
export interface InferableComponentEnhancerWithProps<TInjectedProps, TNeedsProps> {
    <P extends TInjectedProps>(
        component: Component<P>
    ): ComponentClass<Omit<P, keyof TInjectedProps> & TNeedsProps> & {WrappedComponent: Component<P>}
}

```
[Omitってlodash](https://lodash.com/docs/4.17.4#omit)でみたことあります。
これってつまり 

```
Omit('a', {a:1,b:2})  => {b:2}
```
ってなるやつです。



つまり、TInjectedPropsのkeyに対応した部分が取り除かれTNeedsPropsが追加されたComponnetを作るみたいです。
今回はTNeedsPropsが``{}``なのでPropsが空になったComponentが作られるわけですね。
これはそのまま ``<Editor />`` を渡すだけでレンダリングされるのでconnectの働きと合致します。
つまり `` InferableComponentEnhancerWithProps<MyCompnentProps, {}>```を返り値として事前に指定すればいいのですね。

それを踏まえて作ったMyConnectがこちらです。

```ts
interface MergeProps<TProps extends { actions: ActionDispatcherBase }> {
  (state: reducers.State, dispatch: Dispatch<AnyAction>, ownProps: TProps): TProps;
}

export function connect<TProps extends { actions: ActionDispatcherBase }>(
  ActionDispatcher: typeof ActionDispatcherBase,
  mergeProps: MergeProps<TProps>): ReactRedux.InferableComponentEnhancer<TProps> {
  return ReactRedux.connect(
    (state: reducers.State) => ({ state }),
    (dispatch: Dispatch<AnyAction>) => ({ dispatch }),
    ({ state }, { dispatch }, ownProps: TProps) => {
      const props = mergeProps(state, dispatch, ownProps);
      return Object.assign({}, props, { actions: new ActionDispatcher(dispatch, state) });
    }
  );
}
```

``InferableComponentEnhancer<TProps>`` は ``InferableComponentEnhancerWithProps<TProps, {}>`` のaliasです。


```ts:型定義抜粋
export type InferableComponentEnhancer<TInjectedProps> =
    InferableComponentEnhancerWithProps<TInjectedProps, {}>
```

です。使うときはこう書きます

```ts:after
export default connect<Props>(
  ActionDispatcher,
  (state, dispatch, ownProps) => ({
    ...ownProps,
    searchKey: state.editor.searchKey,
  })
)(Editor);

```

beforeはこうでした。

```ts:before
export default connect(
  (state: reducers.State) => ({ state }),
  dispatch => ({ dispatch }),
  ({ state }, { dispatch }) => (
    {
      searchKey: state.editor.searchKey,
      actions: new ActionDispatcher(dispatch, state)
    }
  )
)(Editor);

```
うーん？コード量減った？これ？






