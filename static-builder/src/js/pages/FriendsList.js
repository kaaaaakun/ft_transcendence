import { FriendsTable } from '@/js/features/friends/FriendsTable'
import { SimpleHeaderLayout } from '@/js/layouts/SimpleHeaderLayout'
import { Teact } from '@/js/libs/teact'
import { userApi } from '@/js/infrastructures/api/userApi'
import { useBanner } from '../hooks/useBanner'
import { useNavigate } from '@/js/libs/router'

export const FriendsList = props => {
  const { showErrorBanner, banners } = useBanner()
  // ステートを定義
  const [friendsList, setFriendsList] = Teact.useState([])
  const [friendRequests, setFriendRequests] = Teact.useState([])
  const [loading, setLoading] = Teact.useState(true)
  const navigate = useNavigate()
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
      setLoading(false)
    })
  }, [props.params.id, loading]) // propsのidが変わったら再度実行

  // APIデータ取得関数
  const friends = id =>
    userApi
      .getFriendsList(id)
      .then(response => {
        if (!response.ok) {
          return response.json().then(errData => {
            throw new Error(errData.error || 'Unknown error occurred')
          })
        }
        return response.json()
      })
      .catch(_error => {
        showErrorBanner({
          message: 'Failed to load friends list',
          onClose: () => {},
        })
      })

  const requests = id =>
    userApi
      .getFriendRequests(id)
      .then(response => {
        if (!response.ok) {
          if (response.status !== 403) {
            return response.json().then(errData => {
              throw new Error(errData.error || 'Unknown error occurred')
            })
          }
          return undefined
        }
        return response.json()
      })
      .catch(_error => {
        showErrorBanner({
          message: 'Failed to load friend requests',
          onClose: () => {},
        })
      })

  // ハンドラー関数をコンポーネント内に移動
  const handleAccept = friendId => {
    userApi
      .acceptFriendRequest(friendId)
      .then(() => {
        setFriendRequests(prev => prev.filter(req => req.id !== friendId))
      })
      .then(_data => {
        navigate(`users/${props.params.id}/friends`)
      })

    setLoading(true)
  }

  const handleReject = friendId => {
    userApi
      .deleteFriend(friendId)
      .then(() => {
        setFriendRequests(prev => prev.filter(req => req.id !== friendId))
      })
      .then(_data => {
        navigate(`users/${props.params.id}/friends`)
      })

    setLoading(true)
  }

  // ローディング中の表示
  if (loading) {
    return SimpleHeaderLayout(
      ...banners,
      Teact.createElement(
        'div',
        { className: 'container bg-white p-4 rounded shadow text-center' },
        'Data loading...',
      ),
    )
  }

  if (!(friendsList || friendRequests)) {
    return SimpleHeaderLayout(
      ...banners,
      Teact.createElement(
        'div',
        { className: 'container bg-white p-4 rounded shadow text-center' },
        'User not found',
      ),
    )
  }

  return SimpleHeaderLayout(
    Teact.createElement(
      'div',
      { className: 'container' },
      ...banners,
      Teact.createElement(
        'div',
        { className: 'container bg-white p-4 rounded shadow' },
        Teact.createElement(FriendsTable, {
          friends: friendsList,
          userName: props.params.id,
          friendRequests: friendRequests,
          onAccept: handleAccept,
          onReject: handleReject,
        }),
      ),
    ),
  )
}
