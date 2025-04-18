import { Teact } from '@/js/libs/teact'

export const FriendsTable = ({ friends, onAccept, onReject }) => {
  const [activeTab, setActiveTab] = Teact.useState('list') // 'list' or 'requests'

  const renderStatus = isOnline => {
    return Teact.createElement(
      'span',
      {
        className: `badge ${isOnline ? 'bg-success' : 'bg-secondary'} rounded-pill`,
      },
      isOnline ? 'オンライン' : 'オフライン',
    )
  }

  const renderTableHeader = () => {
    return Teact.createElement(
      'thead',
      null,
      Teact.createElement(
        'tr',
        null,
        Teact.createElement('th', null, '名前'),
        Teact.createElement('th', null, 'ステータス'),
        activeTab === 'requests'
          ? Teact.createElement('th', null, 'アクション')
          : Teact.createElement('th', null, ''),
      ),
    )
  }

  const renderTableRow = friend => {
    return Teact.createElement(
      'tr',
      { key: friend.id },
      Teact.createElement('td', null, friend.friend_name),
      Teact.createElement('td', null, renderStatus(friend.is_online)),
      activeTab === 'requests'
        ? Teact.createElement(
            'td',
            { className: 'action-buttons' },
            Teact.createElement(
              'button',
              {
                className: 'btn btn-success btn-sm me-2',
                onClick: () => onAccept(friend.id),
              },
              '承認',
            ),
            Teact.createElement(
              'button',
              {
                className: 'btn btn-danger btn-sm',
                onClick: () => onReject(friend.id),
              },
              '拒否',
            ),
          )
        : Teact.createElement('td', null, ''),
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
        'フレンド一覧',
      ),
      Teact.createElement(
        'button',
        {
          className: `nav-link ${activeTab === 'requests' ? 'active' : ''}`,
          onClick: () => setActiveTab('requests'),
        },
        'フレンド申請',
      ),
    ),
    Teact.createElement(
      'table',
      { className: 'table table-hover friend-table' },
      renderTableHeader(),
      Teact.createElement('tbody', null, ...friends.map(renderTableRow)),
    ),
  )
}
