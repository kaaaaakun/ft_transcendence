import { Teact } from '@/js/libs/teact'

// 参加者ボードを作成する共通関数
const createParticipantBoard = (participant, x, y) => {
  const xAdjustment = 5
  const yAdjustment = 12
  const textWidth = 110
  const textHeight = 20
  const otherColor = '#182F44'

  const playerName =
    participant.display_name || participant.player?.name || 'Waiting...'

  return [
    Teact.createElement('rect', {
      x: x - xAdjustment,
      y: y - yAdjustment,
      width: textWidth,
      height: textHeight,
      fill: otherColor,
      stroke: 'white',
      'stroke-width': 0.5,
    }),
    Teact.createElement(
      'text',
      {
        x: x,
        y: y,
        'dominant-baseline': 'middle',
        'font-size': '12',
        fill: 'white',
        textLength: '100',
      },
      playerName,
    ),
  ]
}

// 4人トーナメント表
const TournamentFourParticipants = ({ participants }) => {
  const paddedParticipants = [...participants]
  while (paddedParticipants.length < 4) {
    paddedParticipants.push({
      display_name: 'Waiting...',
      user_id: `waiting_${paddedParticipants.length}`,
    })
  }

  return Teact.createElement(
    'div',
    { className: 'position-relative' },
    Teact.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        height: '400px',
        viewBox: '-40,-30, 528,209',
        className: 'svg mx-auto p-2',
        width: '100%',
      },
      // 4人トーナメント表
      ...createParticipantBoard(paddedParticipants[0], 2, 30),
      ...createParticipantBoard(paddedParticipants[1], 2, 60),
      ...createParticipantBoard(paddedParticipants[2], 329, 30),
      ...createParticipantBoard(paddedParticipants[3], 329, 60),

      // 接続線
      Teact.createElement('path', {
        d: 'M133,30 L165,30z',
        stroke: 'yellow',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M133,60 L165,60z',
        stroke: 'yellow',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M298,30 L266,30z',
        stroke: 'yellow',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M298,60 L266,60z',
        stroke: 'yellow',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M164,30 L164,45z',
        stroke: 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M164,60 L164,45z',
        stroke: 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M266,30 L266,45z',
        stroke: 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M266,60 L266,45z',
        stroke: 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M163,45 L215,45z',
        stroke: 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M215,45 L215,25z',
        stroke: 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M266,45 L215,45z',
        stroke: 'black',
        'stroke-width': '2',
      }),
    ),
  )
}

// 8人トーナメント表
const TournamentEightParticipants = ({ participants }) => {
  const paddedParticipants = [...participants]
  while (paddedParticipants.length < 8) {
    paddedParticipants.push({
      /* biome-ignore lint/style/useNamingConvention: API responseのjson dataと合わせる必要があるため*/
      display_name: 'Waiting...',
      /* biome-ignore lint/style/useNamingConvention: API responseのjson dataと合わせる必要があるため*/
      user_id: `waiting_${paddedParticipants.length}`,
    })
  }

  return Teact.createElement(
    'div',
    { className: 'position-relative' },
    Teact.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        height: '500px',
        viewBox: '-40,-30, 528,300',
        className: 'svg mx-auto p-2',
        width: '100%',
      },
      // 左ブロック
      ...createParticipantBoard(paddedParticipants[0], 2, 30),
      ...createParticipantBoard(paddedParticipants[1], 2, 60),
      ...createParticipantBoard(paddedParticipants[2], 2, 90),
      ...createParticipantBoard(paddedParticipants[3], 2, 120),

      // 右ブロック
      ...createParticipantBoard(paddedParticipants[4], 329, 30),
      ...createParticipantBoard(paddedParticipants[5], 329, 60),
      ...createParticipantBoard(paddedParticipants[6], 329, 90),
      ...createParticipantBoard(paddedParticipants[7], 329, 120),

      // 接続線（8人用）
      Teact.createElement('path', {
        d: 'M133,30 L165,30z',
        stroke: 'yellow',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M133,60 L165,60z',
        stroke: 'yellow',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M133,90 L165,90z',
        stroke: 'yellow',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M133,120 L165,120z',
        stroke: 'yellow',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M298,30 L266,30z',
        stroke: 'yellow',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M298,60 L266,60z',
        stroke: 'yellow',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M298,90 L266,90z',
        stroke: 'yellow',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M298,120 L266,120z',
        stroke: 'yellow',
        'stroke-width': '2',
      }),

      // 1回戦から準決勝への線
      Teact.createElement('path', {
        d: 'M164,30 L164,45z M164,60 L164,45z',
        stroke: 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M164,90 L164,105z M164,120 L164,105z',
        stroke: 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M266,30 L266,45z M266,60 L266,45z',
        stroke: 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M266,90 L266,105z M266,120 L266,105z',
        stroke: 'black',
        'stroke-width': '2',
      }),

      // 準決勝から決勝への線
      Teact.createElement('path', {
        d: 'M163,45 L195,45z M195,45 L195,75z',
        stroke: 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M163,105 L195,105z M195,105 L195,75z',
        stroke: 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M267,45 L235,45z M235,45 L235,75z',
        stroke: 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M267,105 L235,105z M235,105 L235,75z',
        stroke: 'black',
        'stroke-width': '2',
      }),

      // 決勝戦
      Teact.createElement('path', {
        d: 'M194,75 L225,75z M225,75 L225,55z',
        stroke: 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M236,75 L225,75z',
        stroke: 'black',
        'stroke-width': '2',
      }),
    ),
  )
}

// メインのトーナメント表コンポーネント
export const TournamentBracket = ({
  participants,
  tournamentType,
  title = 'Tournament Preview',
}) => {
  if (!participants || participants.length === 0) {
    return null
  }

  return Teact.createElement(
    'div',
    { className: 'mt-4' },
    Teact.createElement('h5', { className: 'text-light mb-3' }, title),
    tournamentType === 8
      ? Teact.createElement(TournamentEightParticipants, { participants })
      : Teact.createElement(TournamentFourParticipants, { participants }),
  )
}
