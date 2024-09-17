import '@/scss/styles.scss'
import { Teact } from '@/js/libs/teact'
import { useNavigate, useLocation } from '@/js/libs/router'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { DefaultButton } from '@/js/components/ui/button'

function sumVictoryCount(players, start, end) {
  let sum = 0
  for (let i = start; i <= end; i++) {
    sum += players[i].tournament_players.victory_count
  }
  return sum
}

function fetchMatch() {
  const navigate = useNavigate()
  console.log('fetchMatch')
  fetch('http://127.0.0.1:4010/api/matches/local', {
    method: 'GET',
  })
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

function getMostVictoriesPlayer(players) {
  let ret = players[0]
  for (const player of players) {
    if (
      player.tournament_players.victory_count >
      ret.tournament_players.victory_count
    ) {
      ret = player
    }
  }
  return ret
}

function createPlayerBoard(player, x, y) {
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
      fill: player.next_player ? fighterColor : otherColor,
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
      player.player.name,
    ),
  ]
}

function createChampionPlayerBoard(players) {
  console.log(sumVictoryCount(players, 0, players.length - 1))
  if (sumVictoryCount(players, 0, players.length - 1) === players.length - 1) {
    const ret = createPlayerBoard(getMostVictoriesPlayer(players), 173, 10)
    return ret
  }
  return []
}

function TournamentTwoPlayers(players) {
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
          players[0].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[0], 2, 30),

      // 右プレイヤー
      Teact.createElement('path', {
        d: 'M315,30 L224,30z',
        stroke:
          players[1].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[1], 329, 30),
      Teact.createElement('path', {
        d: 'M224,30 L224,10z',
        stroke: sumVictoryCount(players, 0, 1) >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createChampionPlayerBoard(players),
    ),
  )
}

function TournamentFourPlayers(players) {
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
          players[0].tournament_players.victory_count >= 0 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[0], 2, 30),
      Teact.createElement('path', {
        d: 'M164,30 L164,45z',
        stroke:
          players[0].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M133,60 L165,60z',
        stroke:
          players[1].tournament_players.victory_count >= 0 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[1], 2, 60),
      Teact.createElement('path', {
        d: 'M164,60 L164,45z',
        stroke:
          players[1].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M255,30 L223,30z',
        stroke:
          players[2].tournament_players.victory_count >= 0 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[2], 329, 30),
      Teact.createElement('path', {
        d: 'M224,30 L224,45z',
        stroke:
          players[2].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M255,60 L223,60z',
        stroke:
          players[3].tournament_players.victory_count >= 0 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[3], 329, 60),
      Teact.createElement('path', {
        d: 'M224,60 L224,45z',
        stroke:
          players[3].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M163,45 L195,45z',
        stroke: sumVictoryCount(players, 0, 1) >= 2 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M194,45 L194,25z',
        stroke: sumVictoryCount(players, 0, 3) >= 3 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M225,45 L193,45z',
        stroke: sumVictoryCount(players, 2, 3) >= 2 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createChampionPlayerBoard(players),
    ),
  )
}

// SVG要素を仮想DOM形式で作成する関数
function TournamentEightPlayers(players) {
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
          players[0].tournament_players.victory_count >= 0 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[0], 2, 30),
      Teact.createElement('path', {
        d: 'M164,30 L164,45z',
        stroke:
          players[0].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M133,60 L165,60z',
        stroke:
          players[1].tournament_players.victory_count >= 0 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[1], 2, 60),
      Teact.createElement('path', {
        d: 'M164,60 L164,45z',
        stroke:
          players[1].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M133,90 L165,90z',
        stroke:
          players[2].tournament_players.victory_count >= 0 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[2], 2, 90),
      Teact.createElement('path', {
        d: 'M164,90 L164,105z',
        stroke:
          players[2].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M133,120 L165,120z',
        stroke:
          players[3].tournament_players.victory_count >= 0 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[3], 2, 120),
      Teact.createElement('path', {
        d: 'M164,120 L164,105z',
        stroke:
          players[3].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M315,30 L283,30z',
        stroke:
          players[4].tournament_players.victory_count >= 0 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[4], 329, 30),
      Teact.createElement('path', {
        d: 'M284,30 L284,45z',
        stroke:
          players[4].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M315,60 L283,60z',
        stroke:
          players[5].tournament_players.victory_count >= 0 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[5], 329, 60),
      Teact.createElement('path', {
        d: 'M284,60 L284,45z',
        stroke:
          players[5].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M315,90 L283,90z',
        stroke:
          players[6].tournament_players.victory_count >= 0 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[6], 329, 90),
      Teact.createElement('path', {
        d: 'M284,90 L284,105z',
        stroke:
          players[6].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M315,120 L283,120z',
        stroke:
          players[7].tournament_players.victory_count >= 0 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createPlayerBoard(players[7], 329, 120),
      Teact.createElement('path', {
        d: 'M284,120 L284,105z',
        stroke:
          players[7].tournament_players.victory_count >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M163,45 L195,45z',
        stroke: sumVictoryCount(players, 0, 1) >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M194,45 L194,75z',
        stroke: sumVictoryCount(players, 0, 1) >= 2 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M163,105 L195,105z',
        stroke: sumVictoryCount(players, 2, 3) >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M194,105 L194,75z',
        stroke: sumVictoryCount(players, 2, 3) >= 2 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M285,45 L253,45z',
        stroke: sumVictoryCount(players, 4, 5) >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M254,45 L254,75z',
        stroke: sumVictoryCount(players, 4, 5) >= 2 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M285,105 L253,105z',
        stroke: sumVictoryCount(players, 6, 7) >= 1 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M254,105 L254,75z',
        stroke: sumVictoryCount(players, 6, 7) >= 2 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M193,75 L225,75z',
        stroke: sumVictoryCount(players, 0, 3) >= 4 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M224,75 L224,55z',
        stroke: sumVictoryCount(players, 0, 7) >= 7 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      Teact.createElement('path', {
        d: 'M255,75 L223,75z',
        stroke: sumVictoryCount(players, 4, 7) >= 4 ? 'yellow' : 'black',
        'stroke-width': '2',
      }),
      ...createChampionPlayerBoard(players),
    ),
  )
}

function ConditionalBranch(players) {
  switch (players.participants.length) {
    case 8:
      return TournamentEightPlayers(players.participants)
    case 4:
      return TournamentFourPlayers(players.participants)
    case 2:
      return TournamentTwoPlayers(players.participants)
    default:
      return Teact.createElement('h1', null, '400 Bad Request')
  }
}

export const Tournament = () => {
  const loc = useLocation()
  if (!loc.state || !loc.state.data) {
    return Teact.createElement('h1', null, '400 Bad Request')
  }
  const players = loc.state.data
  return BaseLayout(
    Teact.createElement(
      'div',
      { className: 'container' },
      ConditionalBranch(players),
      Teact.createElement(
        'div',
        { className: 'd-grid gap-2 col-3 mx-auto' },
        DefaultButton({
          text: '対戦へ',
          onClick: fetchMatch,
        }),
      ),
    ),
  )
}
