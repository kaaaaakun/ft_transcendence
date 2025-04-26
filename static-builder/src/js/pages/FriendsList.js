import { FriendsTable } from '@/js/features/friends/FriendsTable'
import { SimpleHeaderLayout } from '@/js/layouts/SimpleHeaderLayout'
import { Teact } from '@/js/libs/teact'

// モックデータ
const mockFriends = [
  { id: 1, friend_name: 'foo', is_online: true },
  { id: 2, friend_name: 'bar', is_online: false },
  { id: 3, friend_name: 'baz', is_online: true },
]

const mockFriendRequests = [
  { id: 1, requester_name: 'a', requestee_name: 'b', requested_at: new Date() },
  { id: 2, requester_name: 'a', requestee_name: 'c', requested_at: new Date() },
  { id: 3, requester_name: 'a', requestee_name: 'd', requested_at: new Date() },
  { id: 4, requester_name: 'e', requestee_name: 'a', requested_at: new Date() },
]

export const FriendsList = props => {
  return SimpleHeaderLayout(
    Teact.createElement(
      'div',
      { className: 'container bg-white p-4 rounded shadow' },
      Teact.createElement(FriendsTable, {
        friends: mockFriends,
        userName: props.params.id,
        friendRequests: mockFriendRequests,
        onAccept: () => {},
        onReject: () => {},
      }),
    ),
  )
}
