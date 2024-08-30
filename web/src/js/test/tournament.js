import '@/scss/styles.scss'
import { BaseLayout } from '@/js/layouts/BaseLayout'
import { Teact } from '@/js/teact'
import { Tournament } from '@/js/features/tournament/Tournament'

function App({ players }) {
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

const container = document.getElementById('app');
Teact.render(Teact.createElement(App, { players }), container);
