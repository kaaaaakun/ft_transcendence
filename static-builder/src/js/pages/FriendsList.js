import { FriendsTable } from '@/js/features/friends/FriendsTable'
import { SimpleHeaderLayout } from '@/js/layouts/SimpleHeaderLayout'
import { Teact } from '@/js/libs/teact'
import { userApi } from '@/js/infrastructures/api/userApi'

export const FriendsList = props => {
  // ステートを定義
  const [friendsList, setFriendsList] = Teact.useState([])
  const [friendRequests, setFriendRequests] = Teact.useState([])
  const [loading, setLoading] = Teact.useState(true)

  // コンポーネントがマウントされたときにデータを取得
  Teact.useEffect(() => {
    // 友達リストの取得
    friends(props.params.id).then(data => {
      setFriendsList(data)
      setLoading(false)
    })

    // 友達リクエストの取得
    requests(props.params.id).then(data => {
      setFriendRequests(data)
    })
  }, [props.params.id]) // propsのidが変わったら再度実行

  // APIデータ取得関数
  const friends = id =>
    userApi
      .getFriendsList({ display_name: id })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errData => {
            throw new Error(errData.error || 'Unknown error occurred')
          })
        }
        return response.json()
      })
      .catch(error => {
        console.error(error)
        return []
      })

  const requests = id =>
    userApi
      .getFriendRequests({ display_name: id })
      .then(response => {
        if (!response.ok) {
          return response.json().then(errData => {
            throw new Error(errData.error || 'Unknown error occurred')
          })
        }
        return response.json()
      })
      .catch(error => {
        console.error(error)
        return []
      })

  // ハンドラー関数をコンポーネント内に移動
  const handleAccept = friendId => {
    userApi
      .acceptFriendRequest({
        user_name: props.params.id,
        friend_name: friendId,
      })
      .then(response => {
        console.log(response)
        // 友達リクエストリストを更新
        setFriendRequests(prev => prev.filter(req => req.id !== friendId))
      })
  }

  const handleReject = friendId => {
    userApi
      .deleteFriend({
        user_name: props.params.id,
        friend_name: friendId,
      })
      .then(response => {
        console.log(response)
        // 友達リクエストリストを更新
        setFriendRequests(prev => prev.filter(req => req.id !== friendId))
      })
  }

  // ローディング中の表示
  if (loading) {
    return SimpleHeaderLayout(
      Teact.createElement(
        'div',
        { className: 'container bg-white p-4 rounded shadow text-center' },
        'データを読み込み中...',
      ),
    )
  }

  return SimpleHeaderLayout(
    Teact.createElement(
      'div',
      { className: 'container bg-white p-4 rounded shadow' },
      Teact.createElement(FriendsTable, {
        friends: friendsList, // ステートから値を渡す
        userName: props.params.id,
        friendRequests: friendRequests, // ステートから値を渡す
        onAccept: handleAccept,
        onReject: handleReject,
      }),
    ),
  )
}
