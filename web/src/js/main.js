import '@/scss/styles.scss'
import javascriptLogo from '@/assets/images/javascript.svg'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/teact'
import viteLogo from '/vite.svg'
import DefaultButton from '@/js/components/ui/button';
import { Tournament } from './features/tournament/Tournament'

// function sumVictoryCount(start, end) {
//   let sum = 0
//   for (let i = start; i <= end; i++) {
//     sum += players[i].victoryCount
//   }
//   return sum
// }

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
    Tournament({players})
  )
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
