import '@/scss/styles.scss'
import javascriptLogo from '@/assets/images/javascript.svg'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/teact'
import viteLogo from '/vite.svg'

function sumVictoryCount(start, end) {
  let sum = 0
  for (let i = start; i <= end; i++) {
    sum += players[i].victoryCount
  }
  return sum
}

// SVG要素を仮想DOM形式で作成する関数
function App({ players }) {
  function sumVictoryCount(start, end) {
    let sum = 0
    for (let i = start; i <= end; i++) {
      sum += players[i].victoryCount
    }
    return sum
  }
  const xAdjustment = 5;
  const yAdjustment = 12;
  const textWidth = 110; // 四角形の幅
  const textHeight = 20; // 四角形の高さ
  const fighterColor = '#FCAA30'
  const otherColor = '#182F44'
  return BaseLayout(
    Teact.createElement(
      'div',
      { className: 'position-relative mt-200'},
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
        Teact.createElement('rect', {
          x: 2 - xAdjustment,
          y: 30 - yAdjustment,
          width: textWidth,
          height: textHeight,
          fill: players[1].nextPlayer ? fighterColor : otherColor,
          stroke: 'white',
          'stroke-width': 0.5
        }),
        Teact.createElement('text', {
          x: '2',
          y: '30',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '1-playername',
          'font-size': '12',
          fill: 'white',
          textLength: '100',
        },
        players[1].name
      ),
        Teact.createElement('path', {
          d: 'M164,30 L164,45z',
          stroke: players[1].victoryCount >= 1 ? 'yellow' : 'black',
          'stroke-width': '2',
          class: 'win-1-1 win-1-2 win-1-3',
        }),
        Teact.createElement('path', {
          d: 'M133,60 L165,60z',
          stroke: players[2].victoryCount >= 0 ? 'yellow' : 'black',
          'stroke-width': '2',
          class: 'win-2-0 win-2-1 win-2-2 win-2-3',
        }),
        Teact.createElement('rect', {
          x: 2 - xAdjustment,
          y: 60 - yAdjustment,
          width: textWidth,
          height: textHeight,
          fill: players[2].nextPlayer ? fighterColor : otherColor,
          stroke: 'white',
          'stroke-width': 0.5
        }),
        Teact.createElement('text', {
          x: '2',
          y: '60',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '2-playername',
          'font-size': '12',
          fill: 'white',
          textLength: '100',
        },
        players[2].name
      ),
        Teact.createElement('path', {
          d: 'M164,60 L164,45z',
          stroke: players[2].victoryCount >= 1 ? 'yellow' : 'black',
          'stroke-width': '2',
          class: 'win-2-1 win-2-2 win-2-3',
        }),
        Teact.createElement('path', {
          d: 'M133,90 L165,90z',
          stroke: players[3].victoryCount >= 0 ? 'yellow' : 'black',
          'stroke-width': '2',
          class: 'win-3-0 win-3-1 win-3-2 win-3-3',
        }),
        Teact.createElement('rect', {
          x: 2 - xAdjustment,
          y: 90 - yAdjustment,
          width: textWidth,
          height: textHeight,
          fill: players[3].nextPlayer ? fighterColor : otherColor,
          stroke: 'white',
          'stroke-width': 0.5
        }),
        Teact.createElement('text', {
          x: '2',
          y: '90',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '3-playername',
          'font-size': '12',
          fill: 'white',
          textLength: '100',
        },
        players[3].name
      ),
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
        Teact.createElement('rect', {
          x: 2 - xAdjustment,
          y: 120 - yAdjustment,
          width: textWidth,
          height: textHeight,
          fill: players[4].nextPlayer ? fighterColor : otherColor,
          stroke: 'white',
          'stroke-width': 0.5
        }),
        Teact.createElement('text', {
          x: '2',
          y: '120',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '4-playername',
          'font-size': '12',
          fill: 'white',
          textLength: '100',
        },
        players[4].name
      ),
        Teact.createElement('path', {
          d: 'M164,120 L164,105z',
          stroke: players[4].victoryCount >= 1 ? 'yellow' : 'black',
          'stroke-width': '2',
          class: 'win-4-1 win-4-2 win-4-3',
        }),
        Teact.createElement('path', {
          d: 'M315,30 L283,30z',
          stroke: players[5].victoryCount >= 0 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('rect', {
          x: 329 - xAdjustment,
          y: 30 - yAdjustment,
          width: textWidth,
          height: textHeight,
          fill: players[5].nextPlayer ? fighterColor : otherColor,
          stroke: 'white',
          'stroke-width': 0.5
        }),
        Teact.createElement('text', {
          x: '329',
          y: '30',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '5-playername',
          'font-size': '12',
          fill: 'white',
          textLength: '100',
        },
        players[5].name
      ),
        Teact.createElement('path', {
          d: 'M284,30 L284,45z',
          stroke: players[5].victoryCount >= 1 ? 'yellow' : 'black',
          'stroke-width': '2',
        }),
        Teact.createElement('path', {
          d: 'M315,60 L283,60z',
          stroke: players[6].victoryCount >= 0 ? 'yellow' : 'black',
          'stroke-width': '2',
          class: 'win-6-0 win-6-1 win-6-2 win-6-3',
        }),
        Teact.createElement('rect', {
          x: 329 - xAdjustment,
          y: 60 - yAdjustment,
          width: textWidth,
          height: textHeight,
          fill: players[6].nextPlayer ? fighterColor : otherColor,
          stroke: 'white',
          'stroke-width': 0.5
        }),
        Teact.createElement('text', {
          x: '329',
          y: '60',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '6-playername',
          'font-size': '12',
          fill: 'white',
          textLength: '100',
        },
      players[6].name
      ),
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
        Teact.createElement('rect', {
          x: 329 - xAdjustment,
          y: 90 - yAdjustment,
          width: textWidth,
          height: textHeight,
          fill: players[7].nextPlayer ? fighterColor : otherColor,
          stroke: 'white',
          'stroke-width': 0.5
        }),
        Teact.createElement('text', {
          x: '329',
          y: '90',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '7-playername',
          'font-size': '12',
          fill: 'white',
          textLength: '100',
        },
        players[7].name
      ),
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
        Teact.createElement('rect', {
          x: 329 - xAdjustment,
          y: 120 - yAdjustment,
          width: textWidth,
          height: textHeight,
          fill: players[8].nextPlayer ? fighterColor : otherColor,
          stroke: 'white',
          'stroke-width': 0.5
        }),
        Teact.createElement('text', {
          x: '329',
          y: '120',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '8-playername',
          'font-size': '12',
          fill: 'white',
          textLength: '100',
        },
        players[3].name
      ),
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
          class: 'win-1-3 win-2-3 win-3-3 win-4-3',
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
    )
  );
}

const players = {
  1: { name: "Alice", victoryCount: 1, nextPlayer: false },
  2: { name: "Bob", victoryCount: 0, nextPlayer: false },
  3: { name: "Charlie", victoryCount: 2, nextPlayer: true },
  4: { name: "David", victoryCount: 0, nextPlayer: false },
  5: { name: "Eve", victoryCount: 1, nextPlayer: false },
  6: { name: "Frank", victoryCount: 0, nextPlayer: false },
  7: { name: "Grace", victoryCount: 2, nextPlayer: true },
  8: { name: "Hank", victoryCount: 0, nextPlayer: false }
};

// アプリケーションをレンダリング
const container = document.getElementById('app');
Teact.render(Teact.createElement(App, { players }), container);
