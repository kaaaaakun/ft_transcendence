import '@/scss/styles.scss'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/libs/teact'

// SVG要素を仮想DOM形式で作成する関数
function svgTest({ players }) {
  const xAdjustment = 5
  const yAdjustment = 12
  const textWidth = 110 // 四角形の幅
  const textHeight = 20 // 四角形の高さ
  const fighterColor = '#FCAA30'
  const otherColor = '#182F44'
  return BaseLayout(
    Teact.createElement(
      'div',
      { className: 'position-relative', style: { margin: '-200px 0 0 0' } },
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
          'stroke-width': 0.5,
        }),
        Teact.createElement(
          'text',
          {
            x: '2',
            y: '30',
            'dominant-baseline': 'middle',
            class: 'playername',
            id: '1-playername',
            'font-size': '12',
            fill: 'white',
            textLength: '100',
          },
          players[1].name,
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
          'stroke-width': 0.5,
        }),
        Teact.createElement(
          'text',
          {
            x: '2',
            y: '60',
            'dominant-baseline': 'middle',
            class: 'playername',
            id: '2-playername',
            'font-size': '12',
            fill: 'white',
            textLength: '100',
          },
          players[2].name,
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
          'stroke-width': 0.5,
        }),
        Teact.createElement(
          'text',
          {
            x: '2',
            y: '90',
            'dominant-baseline': 'middle',
            class: 'playername',
            id: '3-playername',
            'font-size': '12',
            fill: 'white',
            textLength: '100',
          },
          players[3].name,
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
          'stroke-width': 0.5,
        }),
        Teact.createElement(
          'text',
          {
            x: '2',
            y: '120',
            'dominant-baseline': 'middle',
            class: 'playername',
            id: '4-playername',
            'font-size': '12',
            fill: 'white',
            textLength: '100',
          },
          players[4].name,
        ),
        Teact.createElement('path', {
          d: 'M164,120 L164,105z',
          stroke: players[4].victoryCount >= 1 ? 'yellow' : 'black',
          'stroke-width': '2',
          class: 'win-4-1 win-4-2 win-4-3',
        }),
      ),
    ),
  )
}

const players = {
  1: { name: 'Alice', victoryCount: 1, nextPlayer: false },
  2: { name: 'Bob', victoryCount: 0, nextPlayer: false },
  3: { name: 'Charlie', victoryCount: 2, nextPlayer: true },
  4: { name: 'David', victoryCount: 0, nextPlayer: false },
  5: { name: 'Eve', victoryCount: 1, nextPlayer: false },
  6: { name: 'Frank', victoryCount: 0, nextPlayer: false },
  7: { name: 'Grace', victoryCount: 2, nextPlayer: true },
  8: { name: 'Hank', victoryCount: 0, nextPlayer: false },
}

const container = document.getElementById('app')
Teact.render(Teact.createElement(svgTest, { players }), container)
