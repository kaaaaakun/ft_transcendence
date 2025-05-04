import { Teact } from '@/js/libs/teact'

export const FriendsTable = ({
  friends,
  userName,
  friendRequests,
  onAccept,
  onReject,
}) => {
  const [activeTab, setActiveTab] = Teact.useState('list') // 'list' or 'requests'

  const renderStatus = isOnline => {
    return Teact.createElement(
      'span',
      {
        className: `badge ${isOnline ? 'bg-success' : 'bg-secondary'} rounded-pill`,
      },
      isOnline ? 'Online' : 'Offline',
    )
  }

  const renderDate = date => {
    return Teact.createElement('span', null, new Date(date).toLocaleString())
  }

  const renderTableHeader = () => {
    return Teact.createElement(
      'thead',
      null,
      Teact.createElement(
        'tr',
        null,
        Teact.createElement('th', null, 'Name'),
        activeTab === 'requests'
          ? Teact.createElement('th', null, 'Requested At')
          : Teact.createElement('th', null, 'Status'),
        activeTab === 'requests'
          ? Teact.createElement('th', null, 'Action')
          : Teact.createElement('th', null, ''),
      ),
    )
  }
  const name = friend => {
    const displayName =
      activeTab === 'list'
        ? friend.friend_name
        : friend.requester_name === userName
          ? friend.requestee_name
          : friend.requester_name

    if (!displayName) {
      return ''
    }

    return Teact.createElement(
      'a',
      {
        href: `/users/${displayName}`,
        className: 'text-decoration-none',
      },
      displayName,
    )
  }

  const requestAction = friend => {
    if (activeTab === 'list') {
      return Teact.createElement('td', null, '')
    }
    if (friend.requester_name === userName) {
      return Teact.createElement(
        'td',
        null,
        Teact.createElement(
          'span',
          {
            className: 'badge bg-dark-subtle rounded-pill',
          },
          'Waiting for Response',
        ),
      )
    }
    return Teact.createElement(
      'td',
      { className: 'action-buttons' },
      Teact.createElement(
        'button',
        {
          className: 'btn btn-success btn-sm me-2',
          onClick: () => onAccept(friend.requester_name),
        },
        'Accept',
      ),
      Teact.createElement(
        'button',
        {
          className: 'btn btn-danger btn-sm',
          onClick: () => onReject(friend.requester_name),
        },
        'Reject',
      ),
    )
  }

  const renderTableRow = friend => {
    const isEmpty =
      friend.id &&
      typeof friend.id === 'string' &&
      friend.id.startsWith('empty-')

    if (isEmpty) {
      // 空の行の場合
      return Teact.createElement(
        'tr',
        { key: friend.id, className: 'empty-row' },
        Teact.createElement('td', null, ''),
        Teact.createElement('td', null, ''),
        Teact.createElement('td', null, ''),
      )
    }
    return Teact.createElement(
      'tr',
      { key: friend.id },
      Teact.createElement('td', null, name(friend)),
      activeTab === 'requests'
        ? Teact.createElement('td', null, renderDate(friend.requested_at))
        : Teact.createElement('td', null, renderStatus(friend.is_online)),
      requestAction(friend),
    )
  }
  // 最大の長さを見つける
  const maxLength = Math.max(
    Array.isArray(friends) ? friends.length : 0,
    Array.isArray(friendRequests) ? friendRequests.length : 0,
  )

  // 必要な数だけ空の要素で埋める配列を作成
  const paddedFriends = Array.isArray(friends) ? [...friends] : []
  const paddedRequests = Array.isArray(friendRequests)
    ? [...friendRequests]
    : []

  // 足りない分を空の要素（null や空のオブジェクト）で埋める
  while (paddedFriends.length < maxLength) {
    paddedFriends.push({
      id: `empty-${paddedFriends.length}`,
      friend_name: '',
      is_online: false,
    })
  }

  while (paddedRequests.length < maxLength) {
    paddedRequests.push({
      id: `empty-${paddedRequests.length}`,
      friend_name: '',
      is_online: false,
    })
  }

  const friendRequestsTab = () => {
    if (friendRequests === undefined) {
      return null
    }
    return Teact.createElement(
      'button',
      {
        className: `nav-link ${activeTab === 'requests' ? 'active' : ''}`,
        onClick: () => setActiveTab('requests'),
      },
      'Friend Request',
    )
  }

  return Teact.createElement(
    'div',
    { className: 'container mt-4' },
    Teact.createElement(
      'div',
      { className: 'nav nav-tabs mb-3' },
      Teact.createElement(
        'button',
        {
          className: `nav-link ${activeTab === 'list' ? 'active' : ''}`,
          onClick: () => setActiveTab('list'),
        },
        'Friends List',
      ),
      friendRequestsTab(),
    ),

    Teact.createElement(
      'table',
      { className: 'table table-hover friend-table' },
      renderTableHeader(),
      activeTab === 'list'
        ? Teact.createElement(
            'tbody',
            null,
            ...paddedFriends.map(renderTableRow),
          )
        : Teact.createElement(
            'tbody',
            null,
            ...paddedRequests.map(renderTableRow),
          ),
    ),
  )
}
