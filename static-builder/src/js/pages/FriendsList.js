import { FriendsTable } from '@/js/features/friends/FriendsTable'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/libs/teact'

// モックデータ
const mockFriends = [
  { id: 1, name: '田中太郎', age: 25, hobby: '読書' },
  { id: 2, name: '鈴木花子', age: 28, hobby: '料理' },
  { id: 3, name: '佐藤一郎', age: 30, hobby: 'スポーツ' },
]

export const FriendsList = () => {
  return BaseLayout(
    Teact.createElement(
      'div',
      { className: 'container bg-white p-4 rounded shadow' },
      Teact.createElement(FriendsTable, { friends: mockFriends }),
    ),
  )
}
