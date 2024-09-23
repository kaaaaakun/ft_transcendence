import '@/scss/styles.scss'
import { Teact } from '@/js/libs/teact'
import { useNavigate, useLocation } from '@/js/libs/router'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { DefaultButton } from '@/js/components/ui/button'
import { api } from '@/js/infrastructures/api/fetch'
import { cookie } from '@/js/infrastructures/cookie/cookie'

function sumVictoryCount(participants, start, end) {
  return participants
    .slice(start, end + 1)
    .reduce(
      (sum, participant) => sum + participant.tournament_players.victory_count,
      0,
    )
}

function fetchMatch(tournamentEnd) {
  const navigate = useNavigate()
  if (tournamentEnd) {
    cookie.deleteTournamentID()
    navigate('/')
    return
  }
  api.get('/api/matches/local/')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json() // レスポンスをJSONとしてパース
    })
    .then(data => {
      console.log('Success:', data) // レスポンスをコンソールに出力
      navigate('/game', { data })
    })
    .catch(error => {
      console.error('Error:', error) // エラー処理
    })
}

function getMostVictoriesParticipants(participants) {
  return participants.reduce((prev, current) =>
    prev.tournament_players.victory_count >
    current.tournament_players.victory_count
      ? prev
      : current,
  )
}

function createParticipantBoard(participant, x, y) {
  const xAdjustment = 5
  const yAdjustment = 12
  const textWidth = 110
  const textHeight = 20
  const fighterColor = '#FCAA30'
  const otherColor = '#182F44'
  return [
    Teact.createElement('rect', {
      x: x - xAdjustment,
      y: y - yAdjustment,
      width: textWidth,
      height: textHeight,
      fill: participant.next_player ? fighterColor : otherColor,
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
      participant.player.name,
    ),
  ]
}

function createChampionParticipantBoard(participants, tournamentEnd) {
  if (tournamentEnd) {
    const ret = createParticipantBoard(
      getMostVictoriesParticipants(participants),
      173,
      10,
    )
    return ret
  }
  return []
}

function TournamentTwoParticipants(participants, tournamentEnd) {
  // const navigate = useNavigate()
  return Teact.createElement(
    'div',
    { className: 'position-relative shift-up-200' },
    Teact.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        height: '100vh',
        viewBox: '-40,-30, 528,209',
        id: 'canvas',
        class: 'svg mx-auto p-2',
        width: '100%',
      },
      // 左プレイヤー
      Teact.createElement('path', {
        d: 'M133,30 L224,30z',
        stroke:
          participants[0].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[0], 2, 30),

      // 右プレイヤー
      Teact.createElement('path', {
        d: 'M315,30 L224,30z',
        stroke:
          participants[1].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[1], 329, 30),
      Teact.createElement('path', {
        d: 'M224,30 L224,10z',
        stroke: sumVictoryCount(participants, 0, 1) >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createChampionParticipantBoard(participants, tournamentEnd),
    ),
    Teact.createElement(
      'div',
      { className: 'd-grid gap-2 col-3 mx-auto shift-up-200' },
      DefaultButton({
        text: tournamentEnd ? 'ホームへ' : '対戦へ',
        onClick: () => fetchMatch(tournamentEnd),
      }),
    ),
  )
}

function TournamentFourParticipants(participants, tournamentEnd) {
  const navigate = useNavigate()
  return Teact.createElement(
    'div',
    { className: 'position-relative shift-up-200' },
    Teact.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        height: '100vh',
        viewBox: '-40,-30, 528,209',
        id: 'canvas',
        class: 'svg mx-auto p-2',
        width: '100%',
      },
      Teact.createElement('path', {
        d: 'M133,30 L165,30z',
        stroke:
          participants[0].tournament_players.victory_count >= 0
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[0], 2, 30),
      Teact.createElement('path', {
        d: 'M164,30 L164,45z',
        stroke:
          participants[0].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M133,60 L165,60z',
        stroke:
          participants[1].tournament_players.victory_count >= 0
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[1], 2, 60),
      Teact.createElement('path', {
        d: 'M164,60 L164,45z',
        stroke:
          participants[1].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M255,30 L223,30z',
        stroke:
          participants[2].tournament_players.victory_count >= 0
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[2], 329, 30),
      Teact.createElement('path', {
        d: 'M224,30 L224,45z',
        stroke:
          participants[2].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M255,60 L223,60z',
        stroke:
          participants[3].tournament_players.victory_count >= 0
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[3], 329, 60),
      Teact.createElement('path', {
        d: 'M224,60 L224,45z',
        stroke:
          participants[3].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M163,45 L195,45z',
        stroke: sumVictoryCount(participants, 0, 1) >= 2 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M194,45 L194,25z',
        stroke: sumVictoryCount(participants, 0, 3) >= 3 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M225,45 L193,45z',
        stroke: sumVictoryCount(participants, 2, 3) >= 2 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createChampionParticipantBoard(participants, tournamentEnd),
    ),
    Teact.createElement(
      'div',
      { className: 'd-grid gap-2 col-3 mx-auto shift-up-200' },
      DefaultButton({
        text: tournamentEnd ? 'ホームへ' : '対戦へ',
        onClick: () => fetchMatch(tournamentEnd),
      }),
    ),
  )
}

// SVG要素を仮想DOM形式で作成する関数
function TournamentEightParticipants(participants, tournamentEnd) {
  const navigate = useNavigate()
  return Teact.createElement(
    'div',
    { className: 'position-relative shift-up-200' },
    Teact.createElement(
      'svg',
      {
        xmlns: 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        height: '100vh',
        viewBox: '-40,-30, 528,209',
        id: 'canvas',
        class: 'svg mx-auto p-2',
        width: '100%',
      },
      Teact.createElement('path', {
        d: 'M133,30 L165,30z',
        stroke:
          participants[0].tournament_players.victory_count >= 0
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[0], 2, 30),
      Teact.createElement('path', {
        d: 'M164,30 L164,45z',
        stroke:
          participants[0].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M133,60 L165,60z',
        stroke:
          participants[1].tournament_players.victory_count >= 0
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[1], 2, 60),
      Teact.createElement('path', {
        d: 'M164,60 L164,45z',
        stroke:
          participants[1].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M133,90 L165,90z',
        stroke:
          participants[2].tournament_players.victory_count >= 0
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[2], 2, 90),
      Teact.createElement('path', {
        d: 'M164,90 L164,105z',
        stroke:
          participants[2].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M133,120 L165,120z',
        stroke:
          participants[3].tournament_players.victory_count >= 0
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[3], 2, 120),
      Teact.createElement('path', {
        d: 'M164,120 L164,105z',
        stroke:
          participants[3].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M315,30 L283,30z',
        stroke:
          participants[4].tournament_players.victory_count >= 0
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[4], 329, 30),
      Teact.createElement('path', {
        d: 'M284,30 L284,45z',
        stroke:
          participants[4].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M315,60 L283,60z',
        stroke:
          participants[5].tournament_players.victory_count >= 0
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[5], 329, 60),
      Teact.createElement('path', {
        d: 'M284,60 L284,45z',
        stroke:
          participants[5].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M315,90 L283,90z',
        stroke:
          participants[6].tournament_players.victory_count >= 0
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[6], 329, 90),
      Teact.createElement('path', {
        d: 'M284,90 L284,105z',
        stroke:
          participants[6].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M315,120 L283,120z',
        stroke:
          participants[7].tournament_players.victory_count >= 0
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      ...createParticipantBoard(participants[7], 329, 120),
      Teact.createElement('path', {
        d: 'M284,120 L284,105z',
        stroke:
          participants[7].tournament_players.victory_count >= 1
            ? 'yellow'
            : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M163,45 L195,45z',
        stroke: sumVictoryCount(participants, 0, 1) >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M194,45 L194,75z',
        stroke: sumVictoryCount(participants, 0, 1) >= 2 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M163,105 L195,105z',
        stroke: sumVictoryCount(participants, 2, 3) >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M194,105 L194,75z',
        stroke: sumVictoryCount(participants, 2, 3) >= 2 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M285,45 L253,45z',
        stroke: sumVictoryCount(participants, 4, 5) >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M254,45 L254,75z',
        stroke: sumVictoryCount(participants, 4, 5) >= 2 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M285,105 L253,105z',
        stroke: sumVictoryCount(participants, 6, 7) >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M254,105 L254,75z',
        stroke: sumVictoryCount(participants, 6, 7) >= 2 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M193,75 L225,75z',
        stroke: sumVictoryCount(participants, 0, 3) >= 4 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M224,75 L224,55z',
        stroke: sumVictoryCount(participants, 0, 7) >= 7 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M255,75 L223,75z',
        stroke: sumVictoryCount(participants, 4, 7) >= 4 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createChampionParticipantBoard(participants, tournamentEnd),
    ),
    Teact.createElement(
      'div',
      { className: 'd-grid gap-2 col-3 mx-auto shift-up-200' },
      DefaultButton({
        text: tournamentEnd ? 'ホームへ' : '対戦へ',
        onClick: () => fetchMatch(tournamentEnd),
      }),
    ),
  )
}

function ConditionalBranch(participants) {
  if (participants.participants.length < 2) {
    return Teact.createElement('h1', null, '400 Bad Request')
  }
  const tournamentEnd = sumVictoryCount(participants.participants, 0, participants.participants.length - 1) === participants.participants.length - 1
  switch (participants.participants.length) {
    case 8:
      return TournamentEightParticipants(participants.participants, tournamentEnd)
    case 4:
      return TournamentFourParticipants(participants.participants, tournamentEnd)
    case 2:
      return TournamentTwoParticipants(participants.participants, tournamentEnd)
    default:
      return Teact.createElement('h1', null, '400 Bad Request')
  }
}

export const Tournament = () => {
  const loc = useLocation()
  if (!loc.state || !loc.state.data) {
    return Teact.createElement('h1', null, '400 Bad Request')
  }
  const participants = loc.state.data
  return BaseLayout(ConditionalBranch(participants))
}
