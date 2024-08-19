import '@/scss/styles.scss'
import javascriptLogo from '@/assets/images/javascript.svg'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/teact'
import viteLogo from '/vite.svg'

// SVG要素を仮想DOM形式で作成する関数
function App() {
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
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-1-0 win-1-1 win-1-2 win-1-3',
        }),
        Teact.createElement('text', {
          x: '2',
          y: '30',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '1-playername',
          'font-size': '12',
          fill: '',
          textLength: '100',
        }),
        Teact.createElement('path', {
          d: 'M164,30 L164,45z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-1-1 win-1-2 win-1-3',
        }),
        Teact.createElement('path', {
          d: 'M133,60 L165,60z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-2-0 win-2-1 win-2-2 win-2-3',
        }),
        Teact.createElement('text', {
          x: '2',
          y: '60',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '2-playername',
          'font-size': '12',
          fill: '',
          textLength: '100',
        }),
        Teact.createElement('path', {
          d: 'M164,60 L164,45z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-2-1 win-2-2 win-2-3',
        }),
        Teact.createElement('path', {
          d: 'M133,90 L165,90z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-3-0 win-3-1 win-3-2 win-3-3',
        }),
        Teact.createElement('text', {
          x: '2',
          y: '90',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '3-playername',
          'font-size': '12',
          fill: '',
          textLength: '100',
        }),
        Teact.createElement('path', {
          d: 'M164,90 L164,105z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-3-1 win-3-2 win-3-3',
        }),
        Teact.createElement('path', {
          d: 'M133,120 L165,120z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-4-0 win-4-1 win-4-2 win-4-3',
        }),
        Teact.createElement('text', {
          x: '2',
          y: '120',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '4-playername',
          'font-size': '12',
          fill: '',
          textLength: '100',
        }),
        Teact.createElement('path', {
          d: 'M164,120 L164,105z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-4-1 win-4-2 win-4-3',
        }),
        Teact.createElement('path', {
          d: 'M315,30 L283,30z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-5-0 win-5-1 win-5-2 win-5-3',
        }),
        Teact.createElement('text', {
          x: '329',
          y: '30',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '5-playername',
          'font-size': '12',
          fill: '',
          textLength: '100',
        }),
        Teact.createElement('path', {
          d: 'M284,30 L284,45z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-5-1 win-5-2 win-5-3',
        }),
        Teact.createElement('path', {
          d: 'M315,60 L283,60z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-6-0 win-6-1 win-6-2 win-6-3',
        }),
        Teact.createElement('text', {
          x: '329',
          y: '60',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '6-playername',
          'font-size': '12',
          fill: '',
          textLength: '100',
        }),
        Teact.createElement('path', {
          d: 'M284,60 L284,45z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-6-1 win-6-2 win-6-3',
        }),
        Teact.createElement('path', {
          d: 'M315,90 L283,90z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-7-0 win-7-1 win-7-2 win-7-3',
        }),
        Teact.createElement('text', {
          x: '329',
          y: '90',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '7-playername',
          'font-size': '12',
          fill: '',
          textLength: '100',
        }),
        Teact.createElement('path', {
          d: 'M284,90 L284,105z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-7-1 win-7-2 win-7-3',
        }),
        Teact.createElement('path', {
          d: 'M315,120 L283,120z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-8-0 win-8-1 win-8-2 win-8-3',
        }),
        Teact.createElement('text', {
          x: '329',
          y: '120',
          'dominant-baseline': 'middle',
          class: 'playername',
          id: '8-playername',
          'font-size': '12',
          fill: '',
          textLength: '100',
        }),
        Teact.createElement('path', {
          d: 'M284,120 L284,105z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-8-1 win-8-2 win-8-3',
        }),
        Teact.createElement('path', {
          d: 'M163,45 L195,45z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-1-1 win-1-2 win-1-3 win-2-1 win-2-2 win-2-3',
        }),
        Teact.createElement('path', {
          d: 'M194,45 L194,75z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-1-2 win-1-3 win-2-2 win-2-3',
        }),
        Teact.createElement('path', {
          d: 'M163,105 L195,105z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-3-1 win-3-2 win-3-3 win-4-1 win-4-2 win-4-3',
        }),
        Teact.createElement('path', {
          d: 'M194,105 L194,75z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-3-2 win-3-3 win-4-2 win-4-3',
        }),
        Teact.createElement('path', {
          d: 'M285,45 L253,45z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-5-1 win-5-2 win-5-3 win-6-1 win-6-2 win-6-3',
        }),
        Teact.createElement('path', {
          d: 'M254,45 L254,75z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-5-2 win-5-3 win-6-2 win-6-3',
        }),
        Teact.createElement('path', {
          d: 'M285,105 L253,105z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-7-1 win-7-2 win-7-3 win-8-1 win-8-2 win-8-3',
        }),
        Teact.createElement('path', {
          d: 'M254,105 L254,75z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-7-2 win-7-3 win-8-2 win-8-3',
        }),
        Teact.createElement('path', {
          d: 'M193,75 L225,75z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-1-3 win-2-3 win-3-3 win-4-3',
        }),
        Teact.createElement('path', {
          d: 'M224,75 L224,55z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-1-3 win-2-3 win-3-3 win-4-3 win-5-3 win-6-3 win-7-3 win-8-3',
        }),
        Teact.createElement('path', {
          d: 'M255,75 L223,75z',
          stroke: 'black',
          'stroke-width': '2',
          class: 'win-5-3 win-6-3 win-7-3 win-8-3',
        })
      )
    )
  );
}

// アプリケーションをレンダリング
const container = document.getElementById('app');
Teact.render(Teact.createElement(App), container);
