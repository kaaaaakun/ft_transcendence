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
  participants: [
    { name: "Alice", victoryCount: 1, nextPlayer: false },
    { name: "Bob", victoryCount: 0, nextPlayer: false },
    { name: "Charlie", victoryCount: 2, nextPlayer: true },
    { name: "David", victoryCount: 0, nextPlayer: false },
    // { name: "Eve", victoryCount: 1, nextPlayer: false },
    // { name: "Frank", victoryCount: 0, nextPlayer: false },
    // { name: "Grace", victoryCount: 2, nextPlayer: true },
    // { name: "Hank", victoryCount: 0, nextPlayer: false }
  ],
};

const container = document.getElementById('app');
Teact.render(Teact.createElement(App, { players }), container);
