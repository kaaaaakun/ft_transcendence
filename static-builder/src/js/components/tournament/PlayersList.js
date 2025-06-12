import { Teact } from '@/js/libs/teact'

export const PlayersList = ({ members, currentPlayers, tournamentType }) => {
  // 重複したプレイヤーを除去
  const uniqueMembers = members.filter(
    (member, index, self) =>
      index === self.findIndex(m => m.user_id === member.user_id),
  )

  return Teact.createElement(
    'div',
    { className: 'mt-4' },
    Teact.createElement(
      'h5',
      { className: 'text-light mb-3' },
      `現在の参加者 (${currentPlayers}/${tournamentType}):`,
    ),
    Teact.createElement(
      'ul',
      { className: 'list-group mb-3' },
      ...uniqueMembers.map((member, index) =>
        Teact.createElement(
          'li',
          {
            key: member.user_id || index,
            className:
              'list-group-item d-flex justify-content-between align-items-center',
          },
          member.display_name,
          Teact.createElement(
            'span',
            { className: 'badge bg-primary rounded-pill' },
            'Ready',
          ),
        ),
      ),
    ),
  )
}
