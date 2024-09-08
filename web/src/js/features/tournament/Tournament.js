import '@/scss/styles.scss'
import { Teact } from '@/js/teact'


// SVG要素を仮想DOM形式で作成する関数
function Tournament({ players }) {
  function sumVictoryCount(start, end) {
    let sum = 0
    for (let i = start; i <= end; i++) {
      sum += players[i].victoryCount
    }
    return sum
  }
  function createPlayerBoard(player, x, y) {
    const xAdjustment = 5;
    const yAdjustment = 12;
    const textWidth = 110;
    const textHeight = 20;
    const fighterColor = '#FCAA30'
    const otherColor = '#182F44'
    return [
      Teact.createElement('rect', {
        x: x - xAdjustment,
        y: y - yAdjustment,
        width: textWidth,
        height: textHeight,
        fill: player.nextPlayer ? fighterColor : otherColor,
        stroke: 'white',
        'stroke-width': 0.5
      }),
      Teact.createElement('text', {
        x: x,
        y: y,
        'dominant-baseline': 'middle',
        'font-size': '12',
        fill: 'white',
        textLength: '100',
      },
      player.name
      )
    ];
  }
  return Teact.createElement(
      'div',
      { className: 'position-relative shift-up-200'},
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
          stroke: players[1].victoryCount >= 0 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createPlayerBoard(players[1], 2, 30),
        Teact.createElement('path', {
          d: 'M164,30 L164,45z',
          stroke: players[1].victoryCount >= 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M133,60 L165,60z',
          stroke: players[2].victoryCount >= 0 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createPlayerBoard(players[2], 2, 60),
        Teact.createElement('path', {
          d: 'M164,60 L164,45z',
          stroke: players[2].victoryCount >= 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M133,90 L165,90z',
          stroke: players[3].victoryCount >= 0 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createPlayerBoard(players[3], 2, 90),
        Teact.createElement('path', {
          d: 'M164,90 L164,105z',
          stroke: players[3].victoryCount >= 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M133,120 L165,120z',
          stroke: players[4].victoryCount >= 0 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createPlayerBoard(players[4], 2, 120),
        Teact.createElement('path', {
          d: 'M164,120 L164,105z',
          stroke: players[4].victoryCount >= 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M315,30 L283,30z',
          stroke: players[5].victoryCount >= 0 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createPlayerBoard(players[5], 329, 30),
        Teact.createElement('path', {
          d: 'M284,30 L284,45z',
          stroke: players[5].victoryCount >= 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M315,60 L283,60z',
          stroke: players[6].victoryCount >= 0 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createPlayerBoard(players[6], 329, 60),
        Teact.createElement('path', {
          d: 'M284,60 L284,45z',
          stroke: players[6].victoryCount >= 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M315,90 L283,90z',
          stroke: players[7].victoryCount >= 0 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createPlayerBoard(players[7], 329, 90),
        Teact.createElement('path', {
          d: 'M284,90 L284,105z',
          stroke: players[7].victoryCount >= 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M315,120 L283,120z',
          stroke: players[8].victoryCount >= 0 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        ...createPlayerBoard(players[8], 329, 120),
        Teact.createElement('path', {
          d: 'M284,120 L284,105z',
          stroke: players[8].victoryCount >= 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M163,45 L195,45z',
          stroke: (sumVictoryCount(1, 2) >= 1) ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M194,45 L194,75z',
          stroke: (sumVictoryCount(1, 2) >= 2) ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M163,105 L195,105z',
          stroke: (sumVictoryCount(3, 4) >= 1) ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M194,105 L194,75z',
          stroke: (sumVictoryCount(3, 4) >= 2) ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M285,45 L253,45z',
          stroke: (sumVictoryCount(5, 6) >= 1) ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M254,45 L254,75z',
          stroke: (sumVictoryCount(5, 6) >= 2) ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M285,105 L253,105z',
          stroke: (sumVictoryCount(7, 8) >= 1) ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M254,105 L254,75z',
          stroke: (sumVictoryCount(7, 8) >= 2) ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M193,75 L225,75z',
          stroke: (sumVictoryCount(1, 4) >= 4) ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M224,75 L224,55z',
          stroke: (sumVictoryCount(1, 8) >= 7) ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M255,75 L223,75z',
          stroke: (sumVictoryCount(5, 8) >= 4) ? 'yellow' : 'black',
          'stroke-width': '2',
        })
      )
    );
}

export { Tournament }
